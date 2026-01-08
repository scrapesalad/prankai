import os
import sqlite3
from typing import Optional
import streamlit as st
import requests
import re
from datetime import datetime, timedelta

from analytics import fetch_calls, compute_template_metrics, leaderboard_rows
from templates_catalog import TEMPLATES, TEMPLATE_BY_ID

# --- CONFIGURATION ---
# WARNING: API keys are hardcoded - DO NOT share this file or commit it to version control!
# For production, use environment variables instead

def get_secret(key: str) -> Optional[str]:
    try:
        return st.secrets.get(key)
    except Exception:
        return None

# OpenAI Configuration
OPENAI_API_KEY = get_secret("OPENAI_API_KEY") or os.environ.get("OPENAI_API_KEY")

# VAPI Configuration
VAPI_API_KEY = get_secret("VAPI_PRIVATE_KEY") or os.environ.get("VAPI_PRIVATE_KEY")
VAPI_PHONE_ID = get_secret("VAPI_PHONE_ID") or os.environ.get("VAPI_PHONE_ID")

# App configuration
APP_BASE_URL = get_secret("APP_BASE_URL") or os.environ.get("APP_BASE_URL") or "http://localhost:8501"


st.title("🎧 Prank Dial AI")
st.markdown("### Custom prank calls with voice AI and smart templates")

if "session_id" not in st.session_state:
    st.session_state["session_id"] = os.urandom(8).hex()

def get_query_param(name: str) -> Optional[str]:
    value = st.query_params.get(name)
    if isinstance(value, list):
        return value[0] if value else None
    return value

# --- 1. CONFIGURE THE PRANK ---
st.subheader("1. Configure Your Prank")

culprit_name = st.text_input("Culprit Name", value="Chris")
caller_name = st.text_input("Caller Name (AI persona)", value="Sterling")

st.markdown("#### ✅ Consent & Safety")
consent_confirmed = st.checkbox(
    "I have consent to place this call and record it where required by law.",
    value=False
)
jurisdiction = st.selectbox(
    "Recording Consent Jurisdiction",
    [
        "One-party consent",
        "Two-party consent",
        "Not sure"
    ],
    index=2
)
recording_consent_obtained = st.checkbox(
    "I have explicit consent to record (required in two-party/unsure jurisdictions).",
    value=False
)
play_consent_message = st.checkbox(
    "Play recording consent disclosure at call start",
    value=True
)
target_category = st.selectbox(
    "Target Category",
    [
        "Personal / Friend",
        "Business (non-sensitive)",
        "Other",
        "Emergency services",
        "Hospitals / Clinics",
        "Schools / Students",
        "Government / Utilities",
        "Financial / Payments"
    ],
    index=0
)

template_options = [t.name for t in TEMPLATES]
template_id_param = get_query_param("template")
default_index = 0
if template_id_param in TEMPLATE_BY_ID:
    default_index = template_options.index(TEMPLATE_BY_ID[template_id_param].name)

template_name = st.selectbox(
    "Template",
    template_options,
    index=default_index
)
template = next(t for t in TEMPLATES if t.name == template_name)
st.caption(template.tagline)

share_url = f"{APP_BASE_URL}/?template={template.template_id}"
st.markdown("##### 🔗 Share this template")
st.text_input("Template share URL", value=share_url, key="template_share_url")

system_prompt = st.text_area(
    "System Prompt (Who is the AI?)",
    value=template.system_prompt
)

first_message = st.text_input(
    "First Message (What does AI say when user answers?)",
    value=template.first_message
)

custom_prompt = st.text_area(
    "Custom Prompt (Your twist or extra instructions)",
    value="Keep the tone playful but believable. If they ask who this is, restate your name calmly."
)

record_call = st.checkbox("Record this call", value=True)
live_listen = st.checkbox("Enable live listen", value=True)
auto_live_listen = st.checkbox("Auto show live listen when ringing", value=True)

st.markdown("#### 🧠 Conversation Program")
hook = st.text_area(
    "Hook (quick opener that grabs attention)",
    value="Open with a friendly, specific reason for the call."
)
confusion = st.text_area(
    "Confusion (introduce the mix-up or odd detail)",
    value="Introduce a small, believable confusion that needs clarification."
)
escalation = st.text_area(
    "Escalation (raise stakes slightly, keep it playful)",
    value="Increase urgency just a bit, but keep it light and non-threatening."
)
resolution = st.text_area(
    "Resolution (wrap up or offer a simple next step)",
    value="Offer a simple resolution and end politely if they seem done."
)
silence_timeout = st.number_input(
    "Silence timeout (seconds) before ending call",
    min_value=3,
    max_value=20,
    value=8
)

# --- 2. OUTREACH ---
st.subheader("2. Make a Call")

customer_number = st.text_input("Customer Phone Number (E.164 format, e.g., +15550001234)")

def is_valid_e164(number: str) -> bool:
    return bool(re.match(r"^\+[1-9]\d{7,14}$", number or ""))

def is_blocked_number(number: str) -> bool:
    # Block obvious emergency numbers and shortcodes.
    normalized = re.sub(r"\D", "", number or "")
    blocked = {"911", "112", "999", "110", "118", "119"}
    return normalized in blocked or len(normalized) <= 3

def can_place_call() -> tuple[bool, str]:
    if not consent_confirmed:
        return False, "Consent is required before placing calls or recordings."
    if not customer_number:
        return False, "Please enter a phone number."
    if not is_valid_e164(customer_number):
        return False, "Phone number must be valid E.164 (e.g., +15550001234)."
    if is_blocked_number(customer_number):
        return False, "Calls to emergency/shortcode numbers are blocked."
    if record_call and jurisdiction in {"Two-party consent", "Not sure"} and not recording_consent_obtained:
        return False, "Recording consent is required in two-party/unsure jurisdictions."
    if target_category in {
        "Emergency services",
        "Hospitals / Clinics",
        "Schools / Students",
        "Government / Utilities",
        "Financial / Payments"
    }:
        return False, "That target category is blocked for safety."
    return True, ""

def get_client_ip() -> Optional[str]:
    # Best-effort IP detection (works behind proxies that set headers).
    try:
        from streamlit.web.server.websocket_headers import _get_websocket_headers
        headers = _get_websocket_headers() or {}
        xff = headers.get("X-Forwarded-For") or headers.get("x-forwarded-for")
        if xff:
            return xff.split(",")[0].strip()
        return headers.get("X-Real-Ip") or headers.get("x-real-ip")
    except Exception:
        return None

def rate_limit_ok() -> tuple[bool, str]:
    # Server-side rate limit: 5 calls per hour per IP (fallback to session).
    now = int(datetime.utcnow().timestamp())
    window_seconds = 3600
    client_ip = get_client_ip()
    key = client_ip or f"session:{st.session_state.get('session_id', 'unknown')}"

    db_path = os.path.join(os.getcwd(), "rate_limits.sqlite")
    with sqlite3.connect(db_path) as conn:
        conn.execute(
            "CREATE TABLE IF NOT EXISTS call_limits (key TEXT, ts INTEGER)"
        )
        conn.execute(
            "DELETE FROM call_limits WHERE ts < ?",
            (now - window_seconds,)
        )
        cur = conn.execute(
            "SELECT COUNT(*) FROM call_limits WHERE key = ?",
            (key,)
        )
        count = cur.fetchone()[0]
        if count >= 5:
            return False, "Rate limit exceeded (5 calls per hour)."
        conn.execute(
            "INSERT INTO call_limits (key, ts) VALUES (?, ?)",
            (key, now)
        )
    if client_ip is None:
        return True, "Rate limit applied per session (IP unavailable)."
    return True, ""

start_disabled = not is_valid_e164(customer_number)
if start_disabled:
    st.caption("Enter a valid E.164 number to enable call start.")

if st.button("📞 Start AI Call", disabled=start_disabled):
    ok, message = can_place_call()
    if not ok:
        st.error(message)
    elif not VAPI_API_KEY or not VAPI_PHONE_ID:
        st.error("Please enter your API Keys in the sidebar.")
    else:
        ok, message = rate_limit_ok()
        if not ok:
            st.error(message)
        else:
            if message:
                st.info(message)
            rendered_system_prompt = (
                f"You are {caller_name}. "
                + system_prompt.format(culprit=culprit_name)
                + "\n\nConversation phases:\n"
                + f"- Hook: {hook}\n"
                + f"- Confusion: {confusion}\n"
                + f"- Escalation: {escalation}\n"
                + f"- Resolution: {resolution}\n\n"
                + "Rules:\n"
                + "- Ask 1 question at a time.\n"
                + "- Mirror the user's last phrase briefly before your next question.\n"
                + "- Confirm key details when mentioned.\n"
                + "- Avoid long monologues (keep responses under 2 sentences when possible).\n\n"
                + f"Additional instructions: {custom_prompt}\n\n"
                + "Exit triggers:\n"
                + "- If the user is upset or asks to stop, apologize and end the call.\n"
                + f"- If silence for {silence_timeout} seconds, politely end the call.\n"
            )
            rendered_first_message = first_message.format(culprit=culprit_name)

            # Construct the API request to Vapi
            headers = {
                "Authorization": f"Bearer {VAPI_API_KEY}",
                "Content-Type": "application/json"
            }

            payload = {
                "phoneNumberId": VAPI_PHONE_ID,
                "customer": {
                    "number": customer_number
                },
                "assistant": {
                    "backgroundSound": "off",
                    "recordingEnabled": record_call,
                    "monitorPlan": {
                        "listenEnabled": live_listen,
                        "listenAuthenticationEnabled": False,
                    },
                    "metadata": {
                        "templateName": template.template_id
                    },
                    "endCallPhrases": [
                        "stop calling",
                        "do not call",
                        "don't call",
                        "remove me",
                        "take me off your list",
                        "stop",
                        "unsubscribe"
                    ],
                    "endCallMessage": "Understood. I will not call again. Goodbye.",
                    "firstMessage": rendered_first_message,
                    "model": {
                        "provider": "openai",
                        "model": "gpt-4o",
                        "messages": [
                            {
                                "role": "system",
                                "content": rendered_system_prompt
                            }
                        ]
                    },
                    "voice": {
                        "provider": "11labs",
                        "voiceId": "ETkKuFgSSzTTF4mWHh9V"
                    }
                }
            }
            if record_call and play_consent_message:
                payload["assistant"]["recordingConsentPlan"] = {
                    "type": "stay-on-line",
                    "message": (
                        "For quality and safety purposes, this call may be recorded. "
                        "Please stay on the line if you consent, or hang up to decline."
                    ),
                    "waitSeconds": 3
                }

            try:
                with st.spinner("Starting call..."):
                    response = requests.post("https://api.vapi.ai/call/phone", json=payload, headers=headers)
                
                if response.status_code == 201:
                    st.success(f"Call initiated to {customer_number}!")
                    result = response.json()
                    st.json(result)
                    st.session_state["last_call_id"] = result.get("id")
                    st.session_state["last_template_name"] = template_name
                else:
                    st.error("Failed to start call.")
                    st.write(response.text)
            except Exception as e:
                st.error(f"An error occurred: {e}")

# --- 3. CALL LOGS & TRANSCRIPTS ---
st.subheader("3. Recent Calls & Transcripts")

st.markdown("#### 🔍 Find Live Listen by Call ID")
call_id_default = st.session_state.get("last_call_id", "")
call_id_lookup = st.text_input("Call ID", value=call_id_default, key="call_id_lookup")
if st.button("🎧 Fetch Live Listen"):
    if not call_id_lookup:
        st.error("Please enter a Call ID.")
    else:
        headers = {
            "Authorization": f"Bearer {VAPI_API_KEY}",
            "Content-Type": "application/json"
        }
        try:
            response = requests.get(f"https://api.vapi.ai/call/{call_id_lookup}", headers=headers)
            if response.status_code == 200:
                call = response.json()
                listen_url = call.get('monitor', {}).get('listenUrl')
                if listen_url:
                    st.success("Live listen URL ready.")
                    st.link_button("Open live listen", listen_url)
                else:
                    st.info("Live listen URL not available yet. Make sure the call is active.")
            else:
                st.error("Failed to fetch call.")
                st.write(response.text)
        except Exception as e:
            st.error(f"An error occurred: {e}")

if auto_live_listen and call_id_lookup:
    headers = {
        "Authorization": f"Bearer {VAPI_API_KEY}",
        "Content-Type": "application/json"
    }
    try:
        response = requests.get(f"https://api.vapi.ai/call/{call_id_lookup}", headers=headers)
        if response.status_code == 200:
            call = response.json()
            listen_url = call.get('monitor', {}).get('listenUrl')
            if listen_url:
                st.info("Live listen is ready.")
                st.link_button("Open live listen", listen_url, key="auto_live_listen_link")
        else:
            st.warning("Auto live listen is waiting for the call to start.")
    except Exception:
        st.warning("Auto live listen is waiting for the call to start.")

st.markdown("#### 📈 Template Performance")
leaderboard_limit = st.slider("Top templates to show", min_value=3, max_value=10, value=5)

def extract_template_name(call: dict) -> str:
    template_id = (
        call.get("metadata", {}).get("templateName")
        or call.get("assistant", {}).get("metadata", {}).get("templateName")
    )
    if template_id and template_id in TEMPLATE_BY_ID:
        return TEMPLATE_BY_ID[template_id].name
    return "Unknown"

page = st.number_input("Page", min_value=1, value=1, step=1)
page_size = st.selectbox("Page size", [5, 10, 20], index=1)

if st.button("🔄 Refresh Call List"):
    st.cache_data.clear()

try:
    calls = fetch_calls(vapi_api_key=VAPI_API_KEY, page=page, page_size=page_size)
except Exception as e:
    st.error(f"Failed to fetch calls: {e}")
    calls = []

if calls:
    st.success(f"Loaded {len(calls)} calls")
    metrics = compute_template_metrics(calls, extract_template_name)
    leaderboard = leaderboard_rows(metrics)
    st.dataframe(leaderboard[:leaderboard_limit], use_container_width=True)

    for call in calls:
        with st.expander(f"📞 Call to {call.get('customer', {}).get('number', 'Unknown')} - {call.get('createdAt', 'N/A')}"):
            st.write(f"**Call ID:** {call.get('id')}")
            st.write(f"**Status:** {call.get('status')}")
            st.write(f"**Duration:** {call.get('endedReason', 'N/A')}")

            # Show transcript if available
            transcript = call.get('transcript') or call.get('artifact', {}).get('transcript')
            if transcript:
                st.write("### 📝 Transcript:")
                st.text_area("Conversation", value=transcript, height=300, key=f"transcript_{call.get('id')}")

            # Show recording if available
            recording_url = (
                call.get('recordingUrl')
                or call.get('recording', {}).get('url')
                or call.get('artifact', {}).get('recordingUrl')
            )
            if recording_url:
                st.write("### 🔊 Recording:")
                st.audio(recording_url)

            # Show live listen if available
            listen_url = call.get('monitor', {}).get('listenUrl')
            if listen_url:
                st.write("### 👂 Live Listen:")
                st.link_button("Open live listen", listen_url)

            # Show messages if available
            if call.get('messages'):
                st.write("### 💬 Messages:")
                for msg in call.get('messages', []):
                    role = msg.get('role', 'unknown')
                    content = msg.get('content', '')
                    st.write(f"**{role.upper()}:** {content}")

            # Show analysis/summary if available
            if call.get('analysis'):
                st.write("### 📊 Analysis:")
                st.json(call.get('analysis'))

            # Download transcript button
            if transcript:
                st.download_button(
                    label="⬇️ Download Transcript",
                    data=transcript,
                    file_name=f"call_transcript_{call.get('id')}.txt",
                    mime="text/plain",
                    key=f"download_{call.get('id')}"
                )
else:
    st.info("No calls found yet. Make a call to see it appear here.")

st.info("💡 Tip: Click 'Refresh Call List' to see your latest calls and transcripts.")
