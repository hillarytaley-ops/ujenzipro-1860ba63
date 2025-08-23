import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AcknowledgementNotificationRequest {
  supplier_email: string;
  delivery_note_number: string;
  acknowledged_by: string;
  acknowledgement_date: string;
  comments?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-acknowledgement-notification function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      supplier_email, 
      delivery_note_number, 
      acknowledged_by, 
      acknowledgement_date,
      comments 
    }: AcknowledgementNotificationRequest = await req.json();

    console.log("Sending acknowledgement notification to:", supplier_email);

    const emailResponse = await resend.emails.send({
      from: "JengaGuard <notifications@resend.dev>",
      to: [supplier_email],
      subject: `Delivery Acknowledged - DN #${delivery_note_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Delivery Acknowledgement Received
          </h1>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #007bff; margin-top: 0;">Delivery Note #${delivery_note_number}</h2>
            <p><strong>Acknowledged by:</strong> ${acknowledged_by}</p>
            <p><strong>Acknowledgement Date:</strong> ${new Date(acknowledgement_date).toLocaleDateString()}</p>
            ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ''}
          </div>
          
          <p>The delivery has been successfully acknowledged by the recipient. You can now proceed with any follow-up actions as needed.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>This is an automated notification from JengaGuard Supply Chain Management System.</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-acknowledgement-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);