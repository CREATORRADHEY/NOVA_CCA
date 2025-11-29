import os
import smtplib
import ssl
from email.message import EmailMessage
from flask import Flask, render_template, request, jsonify
from twilio.rest import Client

app = Flask(__name__)

TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "YOUR_TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "YOUR_TWILIO_AUTH_TOKEN")
TWILIO_NUMBER = os.environ.get("TWILIO_NUMBER", "YOUR_TWILIO_NUMBER")
DEFAULT_USER_NUMBER = os.environ.get("DEFAULT_USER_NUMBER", "YOUR_USER_NUMBER")

EMAIL_SENDER = os.environ.get("EMAIL_SENDER", "YOUR_EMAIL_ADDRESS")
EMAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD", "YOUR_EMAIL_PASSWORD")
EMAIL_RECEIVER = os.environ.get("EMAIL_RECEIVER", "YOUR_RECEIVER_EMAIL")


try:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
except Exception as e:
    print(f"Error initializing Twilio client: {e}")
    twilio_client = None


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/process_command', methods=['POST'])
def process_command():
    data = request.json
    command = data.get('command', '').lower()
    
    response_text = "I'm not sure how to help with that."
    action = None
    
    if "appointment" in command or "book" in command:
        response_text = "I can help you book an appointment. Sending you the details now."
        action = "book_appointment"
        
        send_sms_internal("Your appointment booking process has started. Please check your email for details.")
        send_email_internal("Appointment Booking", "Please click here to complete your booking: [Link]")
        
    elif "shoe" in command or "product" in command:
        response_text = "Here are our latest shoe collections."
        action = "show_products"
        
    elif "hello" in command or "hi" in command:
        response_text = "Hello! I am Nova, your customer care assistant. How can I help you today?"
        
    elif "call" in command:
         response_text = "Initiating a call to your registered number."
         action = "make_call"
         make_call_internal()

    return jsonify({
        "response": response_text,
        "action": action
    })


@app.route('/voice', methods=['POST'])
def voice():
    """Twilio webhook for incoming calls."""
    from twilio.twiml.voice_response import VoiceResponse, Gather

    resp = VoiceResponse()
    
    
    gather = Gather(input='speech', action='/voice/handle_input', timeout=3, language='en-US')
    gather.say("Welcome to Nova Customer Care. We are happy to assist you. Which shoe trial would you like to book an appointment for? Please say the name of the shoe.", voice='alice')
    
    resp.append(gather)
    
    
    resp.say("We didn't receive any input. Goodbye!", voice='alice')
    return str(resp)


@app.route('/voice/handle_input', methods=['POST'])
def voice_handle_input():
    """Handle speech input from the user."""
    from twilio.twiml.voice_response import VoiceResponse

    resp = VoiceResponse()
    speech_result = request.values.get('SpeechResult', '').strip()
    caller_number = request.values.get('From', 'Unknown')

    if speech_result:
        
        resp.say(f"Thank you. We have booked an appointment for a trial of {speech_result}. A confirmation email with full details has been sent to you.", voice='alice')
        
        
        email_subject = f"Appointment Confirmation: {speech_result}"
        email_body = f"""
        Dear Customer,
        
        This is a confirmation that your appointment for the '{speech_result}' shoe trial has been booked successfully.
        
        Details:
        Product: {speech_result}
        Phone: {caller_number}
        
        Thank you for choosing Nova.
        """
        send_email_internal(email_subject, email_body)
        
    else:
        resp.say("I didn't catch that. Please try calling again.", voice='alice')

    return str(resp)


def send_sms_internal(body, to_number=DEFAULT_USER_NUMBER):
    if not twilio_client:
        print("Twilio client not initialized.")
        return False
    try:
        message = twilio_client.messages.create(
            body=body,
            from_=TWILIO_NUMBER,
            to=to_number
        )
        print(f"SMS sent: {message.sid}")
        return True
    except Exception as e:
        print(f"Error sending SMS: {e}")
        return False

def make_call_internal(to_number=DEFAULT_USER_NUMBER):
    if not twilio_client:
        print("Twilio client not initialized.")
        return False
    try:
        
        twiml_instruction = """
        <Response>
            <Say voice="alice">Hello, this is Nova. Which shoe would you like to try? Please say the name of the shoe.</Say>
            <Gather input="speech" action="/voice/handle_input" timeout="5" language="en-US">
            </Gather>
            <Say voice="alice">We didn't receive any input. Goodbye.</Say>
        </Response>
        """
        
        call = twilio_client.calls.create(
            twiml=twiml_instruction,
            to=to_number,
            from_=TWILIO_NUMBER
        )
        print(f"Call initiated: {call.sid}")
        return True
    except Exception as e:
        print(f"Error making call: {e}")
        return False

def send_email_internal(subject, content, to_email=EMAIL_RECEIVER):
    msg = EmailMessage()
    msg["From"] = EMAIL_SENDER
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(content)
    
    context = ssl.create_default_context()
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.send_message(msg)
        print("Email sent successfully.")
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

if __name__ == '__main__':
    app.run(debug=True, port=5000)
