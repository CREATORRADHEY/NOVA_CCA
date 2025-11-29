# NOVA CCA - Customer Care Assistant

NOVA CCA is a smart Customer Care Assistant application built with Python and Flask. It leverages Twilio for voice and SMS capabilities and SMTP for email notifications to provide a seamless customer service experience.

## 🚀 Features

- **Interactive Web Interface**: A clean and responsive dashboard for users to interact with the assistant.
- **Appointment Booking**: Users can book appointments for shoe trials directly through the interface or via voice commands.
- **Product Showcase**: View the latest shoe collections.
- **Voice Support**:
  - **Inbound Calls**: Handles incoming calls, greets users, and accepts voice commands to book appointments.
  - **Outbound Calls**: Can initiate calls to users for support or confirmation.
- **Multi-Channel Notifications**:
  - **SMS**: Sends instant SMS confirmations using Twilio.
  - **Email**: Sends detailed appointment confirmations via Email.

## 🛠️ Tech Stack

- **Backend**: Python, Flask
- **Communication**: Twilio API (Voice & SMS)
- **Email**: Python `smtplib` & `ssl`
- **Frontend**: HTML, CSS, JavaScript

## ⚙️ Setup & Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/CREATORRADHEY/NOVA_CCA.git
    cd NOVA_CCA
    ```

2.  **Create a virtual environment** (optional but recommended):

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies**:

    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables**:
    Create a `.env` file or set the following environment variables in your system:

    ```bash
    export TWILIO_ACCOUNT_SID="your_twilio_sid"
    export TWILIO_AUTH_TOKEN="your_twilio_auth_token"
    export TWILIO_NUMBER="your_twilio_phone_number"
    export DEFAULT_USER_NUMBER="your_target_phone_number"
    export EMAIL_SENDER="your_email@gmail.com"
    export EMAIL_PASSWORD="your_app_password"
    export EMAIL_RECEIVER="receiver_email@gmail.com"
    ```

5.  **Run the Application**:

    ```bash
    python app.py
    ```

6.  **Access the App**:
    Open your browser and go to `http://127.0.0.1:5000`.

## 📞 Usage

- **Chat Interface**: Type commands like "book appointment", "show shoes", or "call me" to interact.
- **Voice Integration**: If configured with a public URL (using ngrok), you can call the Twilio number to interact with Nova via voice.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
