import os
from typing import Optional
import streamlit as st

from templates_catalog import TEMPLATES, TEMPLATE_BY_ID


def get_secret(key: str) -> Optional[str]:
    try:
        return st.secrets.get(key)
    except Exception:
        return None


APP_BASE_URL = get_secret("APP_BASE_URL") or os.environ.get("APP_BASE_URL") or "http://localhost:8501"


st.title("Public Template Gallery")
st.markdown("Browse prank call templates and share them with friends. These pages are designed for discovery and sharing.")

query_template_id = st.query_params.get("template")
if isinstance(query_template_id, list):
    query_template_id = query_template_id[0] if query_template_id else None

search = st.text_input("Search templates", value="")
tag_filter = st.selectbox(
    "Filter by tag",
    ["All"] + sorted({tag for template in TEMPLATES for tag in template.tags}),
    index=0
)

def matches(template):
    if search and search.lower() not in template.name.lower():
        return False
    if tag_filter != "All" and tag_filter not in template.tags:
        return False
    return True

templates = [t for t in TEMPLATES if matches(t)]

if query_template_id and query_template_id in TEMPLATE_BY_ID:
    template = TEMPLATE_BY_ID[query_template_id]
    st.markdown("### Featured Template")
    st.markdown(f"**{template.name}** — {template.tagline}")
    st.write(template.system_prompt or "Custom prompt template")
    st.markdown("#### Share")
    st.text_input(
        "Share link",
        value=f\"{APP_BASE_URL}/?template={template.template_id}\",
        key="featured_share_link"
    )
    st.link_button("Use this template", f"{APP_BASE_URL}/?template={template.template_id}")
    st.divider()

st.markdown("### All Templates")
if not templates:
    st.info("No templates match your filters.")
else:
    for template in templates:
        with st.container(border=True):
            st.markdown(f"**{template.name}**")
            st.caption(template.tagline)
            if template.tags:
                st.write("Tags:", ", ".join(template.tags))
            st.link_button("Open template", f"{APP_BASE_URL}/?template={template.template_id}")
            st.text_input(
                "Share link",
                value=f"{APP_BASE_URL}/Template_Gallery?template={template.template_id}",
                key=f"share_{template.template_id}"
            )
