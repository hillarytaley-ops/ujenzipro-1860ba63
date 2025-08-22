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

    const { purchaseOrderId, poNumber, supplierName, totalAmount, items } = await req.json()

    if (!purchaseOrderId || !poNumber) {
      return new Response(
        JSON.stringify({ error: 'Purchase Order ID and PO Number are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Generating QR code for PO:', poNumber)

    // Create QR code data with purchase order information
    const qrData = {
      type: 'PURCHASE_ORDER',
      poNumber: poNumber,
      purchaseOrderId: purchaseOrderId,
      supplier: supplierName,
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
    const fileName = `po-${poNumber}-${Date.now()}.png`
    const filePath = `purchase-orders/${fileName}`

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

    console.log('QR code uploaded successfully, updating purchase order...')

    // Update purchase order with QR code URL
    const { error: updateError } = await supabase
      .from('purchase_orders')
      .update({
        qr_code_url: qrCodeUrl,
        qr_code_generated: true
      })
      .eq('id', purchaseOrderId)

    if (updateError) {
      console.error('Update error:', updateError)
      throw new Error(`Failed to update purchase order: ${updateError.message}`)
    }

    console.log('Purchase order updated successfully')

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