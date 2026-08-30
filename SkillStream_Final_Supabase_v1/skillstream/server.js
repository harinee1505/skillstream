const http=require("http"),fs=require("fs"),path=require("path");
const port=process.env.PORT||3000;
const root=__dirname;
http.createServer((req,res)=>{let u=req.url.split("?")[0]; if(u==="/")u="/index.html"; const file=path.join(root,u); if(!file.startsWith(root)){res.writeHead(403);return res.end("Forbidden");} fs.readFile(file,(e,d)=>{if(e){res.writeHead(404);return res.end("Not found");} const ext=path.extname(file); const types={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml"}; res.writeHead(200,{"Content-Type":types[ext]||"application/octet-stream"});res.end(d);});}).listen(port,()=>console.log(`SkillStream running at http://localhost:${port}`));
