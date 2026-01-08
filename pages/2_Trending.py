import os
from typing import Optional
from datetime import datetime, timedelta
import streamlit as st

from analytics import fetch_calls, compute_template_metrics, leaderboard_rows
from templates_catalog import TEMPLATE_BY_ID


def get_secret(key: str) -> Optional[str]:
    try:
        return st.secrets.get(key)
    except Exception:
        return None


VAPI_API_KEY = get_secret("VAPI_PRIVATE_KEY") or os.environ.get("VAPI_PRIVATE_KEY")

st.title("Trending Templates This Week")
st.markdown("A leaderboard based on recent calls. Filtered to the last 7 days.")

def extract_template_name(call: dict) -> str:
    template_id = (
        call.get("metadata", {}).get("templateName")
        or call.get("assistant", {}).get("metadata", {}).get("templateName")
    )
    if template_id and template_id in TEMPLATE_BY_ID:
        return TEMPLATE_BY_ID[template_id].name
    return "Unknown"

def is_recent(call: dict, days: int) -> bool:
    created = call.get("createdAt")
    if not created:
        return False
    try:
        created_dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
        return created_dt >= datetime.utcnow() - timedelta(days=days)
    except Exception:
        return False

if not VAPI_API_KEY:
    st.error("Vapi API key is required to load trending templates.")
else:
    days = st.slider("Days to consider", min_value=3, max_value=30, value=7)
    pages_to_scan = st.slider("Pages to scan", min_value=1, max_value=5, value=2)
    page_size = st.selectbox("Page size", [10, 20, 50], index=1)

    calls = []
    for page in range(1, pages_to_scan + 1):
        try:
            calls.extend(fetch_calls(vapi_api_key=VAPI_API_KEY, page=page, page_size=page_size))
        except Exception:
            break

    recent_calls = [call for call in calls if is_recent(call, days)]
    if not recent_calls:
        st.info("No recent calls found for this time window.")
    else:
        metrics = compute_template_metrics(recent_calls, extract_template_name)
        leaderboard = leaderboard_rows(metrics)
        st.dataframe(leaderboard, use_container_width=True)
