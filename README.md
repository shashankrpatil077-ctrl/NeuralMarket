<!-- Animated Header -->
<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0d1117,50:1a1b27,100:161b22&height=200&section=header&text=NeuralMarket&fontSize=50&fontColor=58a6ff&animation=fadeIn&fontAlignY=35&desc=HTTP%20402%20Payment%20Protocol%20Client&descSize=18&descColor=8b949e&descAlignY=55" />

<div align="center">

[![Python](https://img.shields.io/badge/Python_3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![httpx](https://img.shields.io/badge/httpx-333333?style=for-the-badge)](https://www.python-httpx.org/)
[![Circle](https://img.shields.io/badge/Circle_USDC-00D395?style=for-the-badge&logoColor=white)](https://www.circle.com/)
[![License](https://img.shields.io/badge/License-MIT-444444?style=for-the-badge)](LICENSE)

<br/>

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=500&size=18&duration=3000&pause=1000&color=58A6FF&center=true&vCenter=true&width=600&lines=Automated+HTTP+402+Payment+Handling;Circle+USDC+Machine-to-Machine+Transactions;Async-First+%7C+Zero+Human+Intervention" alt="Typing SVG" />

</div>

---

## ▸ Overview

**NeuralMarket** is an intelligent HTTP client built in Python that automatically handles the `402 Payment Required` flow. By integrating with Circle USDC, it enables seamless, programmatic machine-to-machine micro-transactions — detect the invoice, pay it, retry the request, all in one function call.

---

## ▸ Features

<table>
  <tr>
    <td width="25%" align="center"><strong>Automated 402 Flow</strong></td>
    <td>Detects <code>402 Payment Required</code> responses, parses the invoice, executes payment, and retries with proof — all transparently within a single function call.</td>
  </tr>
  <tr>
    <td align="center"><strong>Circle USDC</strong></td>
    <td>Fast, low-fee stablecoin transfers via the Circle Programmable Wallets API. No volatile crypto — payments are denominated in USD.</td>
  </tr>
  <tr>
    <td align="center"><strong>Async-First</strong></td>
    <td>Built on <code>httpx</code> with full <code>async/await</code> support for high-throughput M2M payment pipelines.</td>
  </tr>
</table>

---

## ▸ System Architecture

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#000000',
    'primaryTextColor': '#F8F8F2',
    'primaryBorderColor': '#333333',
    'lineColor': '#444444',
    'secondaryColor': '#0A0A0A',
    'tertiaryColor': '#111111'
  }
}}%%
graph TB
    classDef client fill:#0A0A0A,stroke:#0070F3,stroke-width:1.5px,color:#FFFFFF,rx:6,ry:6
    classDef core fill:#0A0A0A,stroke:#7928CA,stroke-width:1.5px,color:#FFFFFF,rx:6,ry:6
    classDef payment fill:#0A0A0A,stroke:#FF0080,stroke-width:1.5px,color:#FFFFFF,rx:6,ry:6
    classDef external fill:#0A0A0A,stroke:#50E3C2,stroke-width:1.5px,color:#FFFFFF,rx:6,ry:6

    subgraph Client["Calling Application"]
        A["AI Agent / Requesting Service"]:::client
    end

    subgraph Core["NeuralMarket Core (Async)"]
        B["HTTP Interceptor"]:::core
        C["402 Invoice Parser"]:::core
        D["Retry & Verification Manager"]:::core
    end

    subgraph Circle["Circle Web3 Infrastructure"]
        E["Programmable Wallet SDK"]:::payment
        F["USDC Smart Contracts"]:::payment
    end

    subgraph ExtAPI["External Provider"]
        G["Paid API Endpoint"]:::external
    end

    A -->|1. fetch()| B
    B -->|2. Initial Request| G
    G -.->|3. HTTP 402 Payment Required| C
    C -->|4. Parse & Authorize| E
    E -->|5. Settle On-Chain| F
    F -.->|6. TxHash Proof| D
    D -->|7. Retry with Proof Header| G
    G -.->|8. HTTP 200 OK (Data)| A
```

---

## ▸ Transaction Sequence


```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#000000',
    'primaryTextColor': '#F8F8F2',
    'primaryBorderColor': '#333333',
    'lineColor': '#444444',
    'secondaryColor': '#0A0A0A',
    'tertiaryColor': '#111111',
    'actorBkg': '#0A0A0A',
    'actorBorder': '#0070F3',
    'actorTextColor': '#FFFFFF',
    'noteBkg': '#0A0A0A',
    'noteBorder': '#7928CA',
    'noteTextColor': '#FFFFFF',
    'sequenceNumberColor': '#FFFFFF'
  }
}}%%
sequenceDiagram
    autonumber
    actor Client as NeuralMarket Client
    participant API as External Paid API
    participant Circle as Circle USDC Network

    Client->>API: HTTP GET /premium-data
    API-->>Client: 402 Payment Required (Invoice)
    
    rect rgb(10, 10, 10)
    Note over Client: Auto-detects invoice & USDC amount
    end
    
    Client->>Circle: Execute USDC Transfer (Wallet to Wallet)
    Circle-->>Client: Tx Confirmed (TxHash Proof)
    
    Client->>API: HTTP GET /premium-data + X-Payment-Proof
    
    rect rgb(10, 10, 10)
    Note over API: Validates TxHash on-chain
    end
    
    API-->>Client: 200 OK — Data Returned
```

---

## ▸ Setup

```bash
git clone https://github.com/shashankrpatil077-ctrl/NeuralMarket.git
cd NeuralMarket
pip install -r requirements.txt
```

Create a `.env` file:

```env
CIRCLE_API_KEY=your_circle_api_key
WALLET_ID=your_circle_wallet_id
```

---

## ▸ Usage

```python
import asyncio
from x402_client import x402_fetch

async def main():
    response = await x402_fetch(
        url="https://api.example.com/premium-data",
        source_wallet_id="your_wallet_id",
        max_price_usdc=0.05,
        method="GET"
    )
    print("Response:", response)

if __name__ == "__main__":
    asyncio.run(main())
```

<details>
<summary><strong>Advanced Configuration</strong></summary>
<br/>

| Parameter | Type | Description |
|---|---|---|
| `url` | `str` | Target API endpoint |
| `source_wallet_id` | `str` | Your Circle wallet ID for payment source |
| `max_price_usdc` | `float` | Maximum USDC you're willing to spend per request |
| `method` | `str` | HTTP method — `GET`, `POST`, `PUT`, `DELETE` |
| `headers` | `dict` | Optional custom headers |
| `body` | `dict` | Optional request body for POST/PUT |
| `timeout` | `float` | Request timeout in seconds (default: 30) |

</details>

---

## ▸ License

MIT License — see [LICENSE](LICENSE) for details.

<!-- Animated Footer -->
<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:161b22,50:1a1b27,100:0d1117&height=120&section=footer" />
