const $ = (id) => document.getElementById(id);
const input = $("input"), output = $("output"), status = $("status"), copy = $("copy");
let tool = "json";
const configs = {
  json: ["FORMAT & VALIDATE","JSON Formatter","Input JSON","Format JSON"],
  base64: ["ENCODE & DECODE","Base64 Converter","Text or Base64","Convert"],
  uuid: ["GENERATE IDENTIFIERS","UUID Generator","Optional: number of UUIDs (1–50)","Generate UUIDs"],
  jwt: ["INSPECT TOKENS","JWT Decoder","Paste a JWT token","Decode JWT"],
  url: ["ENCODE & DECODE","URL Encoder / Decoder","Text or URL-encoded text","Convert"],
  hash: ["CRYPTOGRAPHIC HASH","SHA-256 Generator","Text to hash","Generate SHA-256"]
};
function showResult(value, message="Done.") {
  output.textContent = value; copy.disabled = false; status.textContent = message;
}
function setTool(next) {
  tool = next;
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tool===tool));
  const c=configs[tool]; $("tool-kicker").textContent=c[0]; $("tool-title").textContent=c[1];
  $("input-label").textContent=c[2]; $("run").textContent=c[3];
  input.value=""; output.textContent="Your result will appear here."; status.textContent=""; copy.disabled=true;
  input.placeholder = tool==="json" ? '{"hello":"world","count":3}' : tool==="uuid" ? "5" : "Enter your input here…";
}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>setTool(b.dataset.tool)));
$("run").addEventListener("click", async()=>{
  const value=input.value;
  try {
    switch(tool) {
      case "json": showResult(JSON.stringify(JSON.parse(value),null,2),"Valid JSON."); break;
      case "base64": {
        const decoded = atob(value.trim());
        try { showResult(new TextDecoder().decode(Uint8Array.from(decoded,c=>c.charCodeAt(0))),"Base64 decoded."); }
        catch { showResult(decoded,"Base64 decoded."); }
        break;
      }
      case "uuid": {
        const n=Number(value||1);
        if(!Number.isInteger(n)||n<1||n>50) throw Error("Enter a whole number from 1 to 50.");
        showResult(Array.from({length:n},()=>crypto.randomUUID()).join("\n"),`${n} UUID(s) generated.`); break;
      }
      case "jwt": {
        const parts=value.trim().split(".");
        if(parts.length!==3) throw Error("A JWT must contain three dot-separated parts.");
        const decode=s=>JSON.stringify(JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0)))),null,2);
        showResult("HEADER\n"+decode(parts[0])+"\n\nPAYLOAD\n"+decode(parts[1])+"\n\nSignature: not verified. This tool only decodes the token.","Decoded locally. Never share sensitive tokens.");
        break;
      }
      case "url": {
        let result; try { result=decodeURIComponent(value); } catch { result=encodeURIComponent(value); }
        showResult(result,"URL conversion complete."); break;
      }
      case "hash": {
        const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));
        showResult([...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join(""),"SHA-256 generated."); break;
      }
    }
  } catch(e) { output.textContent=""; copy.disabled=true; status.textContent=e.message||"Could not process this input."; status.style.color="#ff9b9b"; return; }
  status.style.color="";
});
$("clear").addEventListener("click",()=>{input.value="";output.textContent="Your result will appear here.";status.textContent="";copy.disabled=true;});
copy.addEventListener("click",async()=>{await navigator.clipboard.writeText(output.textContent);status.textContent="Copied to clipboard.";});
