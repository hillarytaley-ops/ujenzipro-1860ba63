import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { 
      purchaseOrderId, 
      deliveryOrderId, 
      orderNumber, 
      poNumber, 
      supplierName, 
      builderName, 
      totalAmount, 
      items,
      orderType = 'PURCHASE_ORDER' 
    } = await req.json()

    const orderId = purchaseOrderId || deliveryOrderId
    const orderNum = poNumber || orderNumber

    if (!orderId || !orderNum) {
      return new Response(
        JSON.stringify({ error: 'Order ID and Order Number are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Generating QR code for order:', orderNum, 'Type:', orderType)

    // Create QR code data with order information
    const qrData = {
      type: orderType,
      orderNumber: orderNum,
      orderId: orderId,
      supplier: supplierName,
      builder: builderName,
      amount: totalAmount,
      generatedAt: new Date().toISOString(),
      items: items || []
    }

    // Generate QR code using QR Server API
    const qrCodeText = JSON.stringify(qrData)
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrCodeText)}&format=png`
    
    console.log('Fetching QR code from API...')
    const qrResponse = await fetch(qrApiUrl)
    
    if (!qrResponse.ok) {
      throw new Error('Failed to generate QR code')
    }

    const qrImageBuffer = await qrResponse.arrayBuffer()
    const fileName = `${orderType.toLowerCase()}-${orderNum}-${Date.now()}.png`
    const filePath = `${orderType === 'PURCHASE_ORDER' ? 'purchase-orders' : 'delivery-orders'}/${fileName}`
    

    console.log('Uploading QR code to storage:', filePath)

    // Upload QR code image to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('qr-codes')
      .upload(filePath, qrImageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(`Failed to upload QR code: ${uploadError.message}`)
    }

    // Get public URL for the uploaded QR code
    const { data: urlData } = supabase.storage
      .from('qr-codes')
      .getPublicUrl(filePath)

    const qrCodeUrl = urlData.publicUrl

    console.log('QR code uploaded successfully, updating order...')

    // Update the appropriate table based on order type
    const tableName = orderType === 'PURCHASE_ORDER' ? 'purchase_orders' : 'delivery_orders'
    const { error: updateError } = await supabase
      .from(tableName)
      .update({
        qr_code_url: qrCodeUrl,
        qr_code_generated: true
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Update error:', updateError)
      throw new Error(`Failed to update ${orderType.toLowerCase()}: ${updateError.message}`)
    }

    console.log('Order updated successfully')

    return new Response(
      JSON.stringify({
        success: true,
        qrCodeUrl: qrCodeUrl,
        fileName: fileName,
        qrData: qrData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error generating QR code:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to generate QR code'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})