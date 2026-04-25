import os
import asyncio
import aiohttp
from dotenv import load_dotenv

load_dotenv()

FEATHERLESS_API_KEY  = os.getenv("FEATHERLESS_API_KEY")
FEATHERLESS_BASE_URL = "https://api.featherless.ai/v1"


async def call_featherless(
    session:     aiohttp.ClientSession,
    agent_name:  str,
    model:       str,
    prompt:      str,
    system:      str   = "",
    max_tokens:  int   = 512,
    temperature: float = 0.7,
    timeout:     int   = 90,
) -> dict:
    if not FEATHERLESS_API_KEY:
        return {"agent": agent_name, "status": "failed", "error": "FEATHERLESS_API_KEY not set in .env", "output": ""}

    headers = {
        "Authorization": f"Bearer {FEATHERLESS_API_KEY}",
        "Content-Type":  "application/json",
    }
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model":       model,
        "messages":    messages,
        "max_tokens":  max_tokens,
        "temperature": temperature,
    }
    try:
        async with session.post(
            f"{FEATHERLESS_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=aiohttp.ClientTimeout(total=timeout),
        ) as response:
            data = await response.json()
            if response.status != 200:
                error_msg = data.get("error", {}).get("message") or f"HTTP {response.status}"
                return {"agent": agent_name, "status": "failed", "error": error_msg, "output": ""}
            output = data["choices"][0]["message"]["content"].strip()
            return {"agent": agent_name, "status": "success", "output": output, "model": model}
    except asyncio.TimeoutError:
        return {"agent": agent_name, "status": "failed", "error": f"Timeout after {timeout}s", "output": ""}
    except Exception as e:
        return {"agent": agent_name, "status": "failed", "error": str(e), "output": ""}


# ── AI/ML API caller (Gemini, Claude, Qwen3-235B …) ──────────────
import asyncio as _asyncio
from openai import OpenAI as _OpenAI
import os as _os

_aiml_client = _OpenAI(
    api_key=_os.getenv("AIML_API_KEY"),
    base_url="https://api.aimlapi.com/v1"
)

async def call_aiml(agent_name, model, prompt,
                    system="You are a helpful AI agent. Be concise.",
                    max_tokens=512, temperature=0.7):
    try:
        resp = await _asyncio.to_thread(
            _aiml_client.chat.completions.create,
            model=model,
            messages=[{"role":"system","content":system},
                      {"role":"user","content":prompt}],
            max_tokens=max_tokens,
            temperature=temperature,
        )
        return {"agent":agent_name,"status":"success",
                "output":resp.choices[0].message.content.strip(),"model":model}
    except Exception as e:
        return {"agent":agent_name,"status":"failed","error":str(e),"output":""}

async def call_agent(session, agent_name, agent, prompt):
    host   = agent.get("host", "Featherless")
    model  = agent["model"]
    system = agent.get("system_prompt", "You are a helpful AI agent.")
    if host == "Featherless":
        result = await call_featherless(session, agent_name, model, prompt, system=system)
    else:
        result = await call_aiml(agent_name, model, prompt, system)
    if result.get("status") == "failed" and agent.get("backup_model"):
        bm = agent["backup_model"]
        bh = agent.get("backup_host", "Featherless")
        print(f"⚠️  {agent_name} primary failed — retrying with backup {bm}...")
        if bh == "Featherless":
            result = await call_featherless(session, agent_name, bm, prompt, system=system)
        else:
            result = await call_aiml(agent_name, bm, prompt, system)
        if result.get("status") == "success":
            result["used_backup"] = True
    return result
