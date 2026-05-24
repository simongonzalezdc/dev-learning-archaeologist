import { writeFile } from "node:fs/promises";
import { brotliCompressSync, constants } from "node:zlib";

const projectName = process.env.UNSTUCK_PROJECT_NAME || "u";
const host = process.env.UNSTUCK_LIVE_HOST || "unstuck.kyanitelabs.tech";
const fallbackHost = process.env.UNSTUCK_FALLBACK_HOST || "srv1542844.hstgr.cloud";
const pathPrefix = process.env.UNSTUCK_LIVE_PATH_PREFIX || "/unstuck";
const liveProvider = process.env.UNSTUCK_LIVE_PROVIDER || "vps-local";
const isZaiCodingPlan = liveProvider === "zai-coding-plan";
const isHomeInference = liveProvider === "home-openai" || liveProvider === "nucbox-openai";
const model = process.env.UNSTUCK_LIVE_MODEL || (isZaiCodingPlan ? "glm-5.1" : "Qwen3.5-0.8B-Q4_K_M");
const baseUrl = isZaiCodingPlan
  ? "https://api.z.ai/api/coding/paas/v4"
  : process.env.UNSTUCK_LIVE_BASE_URL || "http://llama-local:8085/v1";
const apiKey = isZaiCodingPlan ? "${ZAI_API_KEY:?ZAI_API_KEY required}" : `\${${process.env.UNSTUCK_LIVE_API_KEY_ENV || "NUCBOX_API_KEY"}:-local}`;
const thinking = isZaiCodingPlan ? ',thinking:{type:"enabled"}' : "";
const contextBase = process.env.UNSTUCK_CONTEXT_BASE || "https://simongonzalezdc.github.io/unstuck-coach";
const outputPath = process.argv[2];
const routeRule = `Host(\`${host}\`) || (Host(\`${fallbackHost}\`) && PathPrefix(\`${pathPrefix}\`))`;

const liveHtml = String.raw`<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Unstuck</title><style>:root{color-scheme:light;--bg:#fff8ec;--p:#fffaf2;--t:#060910;--m:#6f625b;--l:#d9d0c4;--u:#edf7f4;--a:#eaf6f3;--c:#2f8e86;--g:#d9a72f}*{box-sizing:border-box}body{margin:0;padding:20px;background:linear-gradient(180deg,var(--p),var(--bg));color:var(--t);font:15px/1.45 system-ui,sans-serif}main{display:grid;grid-template-rows:auto 1fr;gap:14px;height:calc(100dvh - 40px);max-width:1240px;margin:auto}.chat-header{display:flex;justify-content:space-between;align-items:end;border-bottom:1px solid var(--l);padding-bottom:12px}.eyebrow{display:block;margin:0 0 4px;color:var(--g);font-size:.76rem;font-weight:800}h1{margin:0;font:500 clamp(2rem,7vw,4.4rem)/.95 Georgia,serif}.work-surface{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:14px;min-height:0}.chat{display:grid;grid-template-rows:1fr auto auto;gap:8px;min-height:0}.log{display:flex;flex-direction:column;gap:10px;overflow:auto}.turn,.card{border:1px solid var(--l);border-radius:8px;background:var(--p);padding:10px}.turn{width:fit-content;max-width:min(76ch,86%);white-space:pre-wrap}.assistant{align-self:flex-start;background:var(--a)}.user{align-self:flex-end;background:var(--u)}.speaker{display:block;color:var(--c);font-weight:800;font-size:.78rem}.chips,.acts,#energy-check{display:flex;gap:7px;flex-wrap:wrap}button,textarea{font:inherit}button{min-height:40px;border:1px solid var(--l);border-radius:8px;background:var(--p);color:var(--t);padding:8px 11px}.row{display:grid;grid-template-columns:auto 1fr auto;gap:8px;border:1px solid var(--l);border-radius:8px;background:#fffaf2;padding:9px}textarea{min-height:42px;resize:none;border:0;background:transparent;color:var(--t);padding:9px 7px;outline:0}.dock{display:flex;flex-direction:column;gap:9px;overflow:auto;border-left:1px solid var(--l);padding-left:14px}.next-card{background:#fff4dc}#relief-map{background:linear-gradient(160deg,rgba(217,167,47,.18),transparent 36%),linear-gradient(24deg,rgba(47,142,134,.16),transparent 46%),#fffaf2}#energy-check button{min-width:34px;min-height:34px;padding:0;color:var(--m);font-weight:800}#energy-check button[aria-pressed=true]{border-color:var(--g);background:linear-gradient(180deg,rgba(229,194,100,.24),rgba(116,216,191,.12));color:var(--t)}@media(max-width:820px){body{padding:10px}main{height:auto;min-height:100dvh}.work-surface{grid-template-columns:1fr}.dock{order:-1;border-left:0;border-bottom:1px solid var(--l);padding:0 0 12px}.turn{max-width:94%}}</style><main><header class=chat-header><div><p class=eyebrow>Unstuck Coach</p><h1>Unstuck</h1></div><strong id=provider>GLM 5.1</strong></header><div class=work-surface><section class=chat><section id=log class=log></section><div class=chips><button data-prompt="I need a coach to start.">First run</button><button data-prompt="I'm frozen.">I'm frozen</button><button data-prompt="Inbox/calendar.">Inbox/calendar</button></div><form id=f><div class=row><button id=voice-button type=button>Mic</button><textarea id=m rows=1 placeholder="Message Unstuck Coach" required></textarea><button type=submit>Send</button></div></form><p id=vstat>Mic</p></section><aside id=coach-dock class=dock data-visual-state=ready><header><p class=eyebrow>Coach Dock</p><strong>One move</strong></header><section id=relief-map class=card><span>Energy now</span><strong id=energy-read>Pick 1-5</strong><div id=energy-check><button data-energy=1>1</button><button data-energy=2>2</button><button data-energy=3>3</button><button data-energy=4>4</button><button data-energy=5>5</button></div></section><section class=card><span>State</span><strong id=state-read>Ready to start</strong></section><section class="card next-card"><span>Next move</span><p id=next-move>Send one stuck point. Fragments count.</p><div class=acts><button data-prompt="Make this easier.">Make easier</button><button data-insert="Smallest next move.">Insert tiny ask</button></div></section><section class=card><span>Check</span><div id=tiny-checks class=acts><button data-prompt="Done.">Done</button><button data-prompt="Too much.">Too much</button></div></section><section class=card><span>Pile</span><div id=held-pile class=held-pile>None parked.</div></section></aside></div></main><script>const $=x=>document.getElementById(x),thread=[],h=[];let energyLevel=0,sr=$("state-read"),nm=$("next-move"),hp=$("held-pile"),er=$("energy-read"),dock=$("coach-dock"),rm=$("relief-map");function esc(s){return String(s).replace(/[<>&]/g,c=>"&#"+c.charCodeAt()+";")}function turn(x,c=""){return"<article class='turn "+x.role+" "+c+"'><span class=speaker>"+(x.role==="assistant"?"Coach":"You")+"</span><div>"+esc(x.content)+"</div></article>"}function inferState(v){return/inbox|calendar|meeting|deadline/i.test(v)?"Calendar/inbox reality":/message|email|\btext\b|reply/i.test(v)?"Communication threat":/\beat\b|food|dopamine|sleep|tired/i.test(v)?"Body or activation fuel":/frozen|stuck|too much|overwhelmed/i.test(v)?"Frozen start":"Ready to start"}function mv(t){return(t.split(/\n+/).find(Boolean)||"Send one stuck point.").replace(/\*\*/g,"").replace(/^(next move|move|try|check):\s*/i,"").slice(0,120)}function add(x){h.includes(x)||h.push(x)}function pile(v){/inbox|email/i.test(v)&&add("Inbox pile");/cal|meet|deadline/i.test(v)&&add("Hard anchor");/message|text|reply/i.test(v)&&add("Message thread");/task|list|project/i.test(v)&&add("Task pile")}function last(r){return thread.filter(x=>x.role===r).pop()?.content||""}function renderReliefMap(s){let v="energy-"+energyLevel+"-"+s.toLowerCase().replace(/\W+/g,"-");dock.setAttribute("data-visual-state",v);rm.setAttribute("data-visual-state",v)}function setEnergy(v){energyLevel=+v;er.textContent=energyLevel+"/5";document.querySelectorAll("[data-energy]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.energy==v));renderDock()}function getEnergyContext(){return energyLevel?"Energy selected: "+energyLevel+"/5. Match the next move to that capacity.":""}function renderDock(){let s=inferState(last("user")+" "+last("assistant"));sr.textContent=s;nm.textContent=mv(last("assistant"));hp.innerHTML=h.join("<br>")||"None parked.";renderReliefMap(s)}function draw(e=""){log.innerHTML=turn({role:"assistant",content:"Tell me what is stuck."})+thread.map(x=>turn(x)).join("")+e;log.scrollTop=log.scrollHeight;renderDock()}function put(v){m.value=v;m.focus()}document.addEventListener("click",e=>{let b=e.target.closest("[data-energy],[data-prompt],[data-insert]");if(!b)return;if(b.dataset.energy)setEnergy(b.dataset.energy);else if(b.dataset.prompt){put(b.dataset.prompt);f.requestSubmit()}else put(b.dataset.insert)});function md(t){$("voice-button").removeAttribute("aria-busy");vstat.textContent=t}function startVoiceInput(){let R=window.SpeechRecognition||window.webkitSpeechRecognition,b=$("voice-button");if(!R){vstat.textContent="No mic.";return put("Help me start.")}let r=new R,err=0;r.interimResults=1;r.onstart=()=>{b.setAttribute("aria-busy","true");vstat.textContent="Listening."};r.onresult=e=>{let t=[...e.results].map(x=>x[0]?.transcript||"").join(" ").trim();if(t)put(t)};r.onerror=e=>{err=1;md(e.error==="not-allowed"?"Blocked":"Failed")};r.onend=()=>md(err?vstat.textContent:m.value.trim()?"Captured":"No speech");try{r.start()}catch{md("Failed")}}$("voice-button").onclick=startVoiceInput;m.onkeydown=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();f.requestSubmit()}};f.onsubmit=async e=>{e.preventDefault();let msg=m.value.trim();if(!msg)return;let old=[...thread];pile(msg);thread.push({role:"user",content:msg});m.value="";draw(turn({role:"assistant",content:"Thinking."},"pending"));try{let b=await(await fetch("./api/coach",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({message:msg,context:getEnergyContext(),history:old})})).json();thread.push({role:"assistant",content:b.reply||b.message||b.error})}catch(x){thread.push({role:"assistant",content:x.message})}draw()};draw()</script></html>`;
const pageBr = brotliCompressSync(Buffer.from(liveHtml), {
  params: { [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY },
}).toString("base64");

const server = String.raw`import{createServer as C}from"node:http";import{brotliDecompressSync as B}from"node:zlib";
const F=[["PROJECT_INSTRUCTIONS.md",2400],["FIRST_RUN.md",1200],["rules.md",1700]];let M="";
async function cc(){if(M)return M;let p=[];for(const[f,n]of F){const r=await fetch(process.env.CONTEXT_BASE_URL+"/"+f);if(!r.ok)throw Error("context "+f);p.push((await r.text()).slice(0,n))}return M=("Unstuck Coach. Reflect once, give one next move, ask one tiny answer. No labels. Choose the move. Use prior turns. First cold prompt: ask for messy pile or any three items.\n"+p.join("\n")).slice(0,8000)}
function S(r,c,o){r.writeHead(c,{"content-type":"application/json"});r.end(JSON.stringify(o))}
async function bd(q){let s="";for await(const c of q){s+=c;if(s.length>32e3)throw Error("413 body too large")}if(!s)return{};try{return JSON.parse(s)}catch{throw Error("400 invalid JSON")}}
function cl(x){return String(x||"").replace(/\s+/g," ").trim().slice(0,4e3)}
function hi(a){return Array.isArray(a)?a.flatMap(x=>{const role=x?.role==="assistant"?"assistant":x?.role==="user"?"user":"";const content=cl(x?.content);return role&&content?[{role,content}]:[]}).slice(-10):[]}
function sh(t){return t.replace(/^\s*(?:\*\*)?(?:State|Friction|Move|Hold|Check|Close)(?:\*\*)?:\s*/gim,"").split(/\n+/).filter(Boolean).slice(0,3).join("\n\n")}
function mk(x){console.log("u "+x+" "+Date.now())}
const page=B(Buffer.from(${JSON.stringify(pageBr)},"base64")).toString();
const H={};let A=0;function ck(q){let o=q.headers.origin,k=q.headers["x-forwarded-for"]||q.socket.remoteAddress,b=H[k]||[0,0],n=Date.now();if(o&&new URL(o).host!==q.headers.host)throw Error("403 origin");if(n>b[1])b=[0,n+6e5];if(++b[0]>20)throw Error("429 rate");H[k]=b;if(A>3)throw Error("429 busy")}
C(async(q,r)=>{try{const u=new URL(q.url,"http://x");if(q.method==="GET"&&u.pathname==="/api/config")return S(r,200,{model:process.env.OPENAI_MODEL});if(q.method==="GET"&&u.pathname==="/"){mk("view");r.writeHead(200,{"content-type":"text/html"});return r.end(page)}if(q.method==="POST"&&u.pathname==="/api/coach"){ck(q);const b=await bd(q),msg=cl(b.message),ctx=cl(b.context);if(!msg)return S(r,400,{error:"message required"});mk("chat");const p={model:process.env.OPENAI_MODEL,max_tokens:1200${thinking},messages:[{role:"system",content:await cc()},...hi(b.history),{role:"user",content:ctx?msg+"\n\nContext:\n"+ctx:msg}]};let rr;A++;try{rr=await fetch(process.env.OPENAI_BASE_URL.replace(/\/$/,"")+"/chat/completions",{method:"POST",headers:{authorization:"Bearer "+process.env.OPENAI_API_KEY,"content-type":"application/json"},signal:AbortSignal.timeout(25e3),body:JSON.stringify(p)})}finally{A--}if(!rr.ok)throw Error("LLM HTTP "+rr.status+": "+(await rr.text()).slice(0,160));const j=await rr.json(),text=j.choices?.[0]?.message?.content?.trim();if(!text)throw Error("no LLM text");mk("reply");return S(r,200,{reply:sh(text)})}const api=u.pathname.startsWith("/api/");S(r,api?405:404,{error:api?"bad method":"not found"})}catch(e){mk("error");const m=/^(\d+) (.+)/.exec(e.message);S(r,m?+m[1]:502,{error:m?m[2]:"demo failed"})}}).listen(process.env.PORT||3000,"0.0.0.0");`;

const compose = `services:
  unstuck-coach-live:
    image: node:22-alpine
    working_dir: /app
    command:
      - sh
      - -lc
      - |
        cat > /app/server.mjs <<'NODE'
${server
  .split("\n")
  .map((line) => `        ${line}`)
  .join("\n")}
        NODE
        node /app/server.mjs
    environment:
      PORT: "3000"
      CONTEXT_BASE_URL: ${contextBase}
      OPENAI_BASE_URL: ${baseUrl}
      OPENAI_API_KEY: ${apiKey}
      OPENAI_MODEL: ${model}
    networks:
      - proxy-net
    labels:
      - traefik.enable=true
      - traefik.http.routers.${projectName}.entrypoints=websecure
      - traefik.http.routers.${projectName}.rule=${routeRule}
      - traefik.http.routers.${projectName}.tls=true
      - traefik.http.routers.${projectName}.tls.certresolver=letsencrypt
      - traefik.http.routers.${projectName}.middlewares=${projectName}-strip,security-headers@file
      - traefik.http.middlewares.${projectName}-strip.stripprefix.prefixes=${pathPrefix}
      - traefik.http.services.${projectName}.loadbalancer.server.port=3000
networks:
  proxy-net:
    external: true
`;

if (outputPath) {
  await writeFile(outputPath, compose);
} else {
  process.stdout.write(compose);
}
