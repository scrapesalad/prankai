from collections import defaultdict
from datetime import datetime
import requests
import streamlit as st


def _safe_iso_seconds(started: str | None, ended: str | None) -> float:
    if started and ended:
        try:
            start_dt = datetime.fromisoformat(started.replace("Z", "+00:00"))
            end_dt = datetime.fromisoformat(ended.replace("Z", "+00:00"))
            return max(0.0, (end_dt - start_dt).total_seconds())
        except Exception:
            return 0.0
    return 0.0


def _transcript_text(call: dict) -> str:
    return call.get("transcript") or call.get("artifact", {}).get("transcript") or ""


def _laugh_event(call: dict) -> bool:
    transcript = _transcript_text(call).lower()
    if any(x in transcript for x in ["lol", "haha", "hahaha", "lmao"]):
        return True
    return bool(call.get("numUserInterrupted") or call.get("numAssistantInterrupted"))


@st.cache_data(ttl=30)
def fetch_calls(vapi_api_key: str, page: int, page_size: int) -> list:
    headers = {
        "Authorization": f"Bearer {vapi_api_key}",
        "Content-Type": "application/json"
    }
    params = {"page": page, "pageSize": page_size}
    response = requests.get("https://api.vapi.ai/call", headers=headers, params=params)
    response.raise_for_status()
    return response.json()


def compute_template_metrics(calls: list, template_name_fn) -> dict:
    metrics = defaultdict(lambda: {"total": 0, "answered": 0, "hangup10": 0, "duration": 0.0, "laugh": 0})
    for call in calls:
        template = template_name_fn(call)
        metrics[template]["total"] += 1
        duration = _safe_iso_seconds(call.get("startedAt"), call.get("endedAt"))
        if duration > 0:
            metrics[template]["answered"] += 1
        if 0 < duration <= 10:
            metrics[template]["hangup10"] += 1
        metrics[template]["duration"] += duration
        if _laugh_event(call):
            metrics[template]["laugh"] += 1
    return metrics


def leaderboard_rows(metrics: dict) -> list:
    rows = []
    for template, data in metrics.items():
        answered = data["answered"]
        total = data["total"]
        avg_duration = (data["duration"] / answered) if answered else 0.0
        rows.append({
            "Template": template,
            "Answer rate": f"{(answered / total * 100.0) if total else 0.0:.0f}%",
            "Hangup <10s": f"{(data['hangup10'] / total * 100.0) if total else 0.0:.0f}%",
            "Avg duration (s)": f"{avg_duration:.0f}",
            "Laugh events": data["laugh"]
        })
    rows.sort(key=lambda x: int(x["Answer rate"].rstrip("%")), reverse=True)
    return rows
