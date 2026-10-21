import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
const root = process.cwd();
const env = Object.fromEntries((await fs.readFile(path.join(root,'.env.local'),'utf8')).split(/\r?\n/).filter(x=>x.includes('=')).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),x.slice(i+1).trim().replace(/^['"]|['"]$/g,'')] }));
const base=(env.WORDPRESS_API_URL||`${env.WORDPRESS_SITE_URL}/wp-json`).replace(/\/$/,''); const woo=`${base}/wc/v3`;
const wpAuth=`Basic ${Buffer.from(`${env.WP_USER}:${env.WP_PASSWORD}`).toString('base64')}`; const wooAuth=`Basic ${Buffer.from(`${env.WORDPRESS_CONSUMER_KEY}:${env.WORDPRESS_CONSUMER_SECRET}`).toString('base64')}`;
const report=await fs.readFile('C:\\Users\\danie\\Downloads\\image-mapping-report-fotos-ms.md','utf8');
const target = process.env.MS_PRODUCT_ID ? Number(process.env.MS_PRODUCT_ID) : null;
const rows=[...report.matchAll(/^\| ([^|]+) \| (\d+) \| ([^|]+) \| (product|variation) \|\s*(\d*)\s*\|/gm)].map(m=>({productId:Number(m[2]),file:m[3].trim(),type:m[4],variationId:m[5]?Number(m[5]):null})).filter(row => ![336,13219].includes(row.productId) && (!target || row.productId === target));
async function api(url,opt={}){const r=await fetch(url,opt);const b=await r.text();if(!r.ok)throw Error(`${r.status} ${url}: ${b.slice(0,300)}`);return b?JSON.parse(b):null}
async function walk(dir){const out=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...await walk(p));else if(e.name.toLowerCase().endsWith('.webp'))out.push(p)}return out}
const temp=await fs.mkdtemp(path.join(os.tmpdir(),'ms-report-')); const mediaByFile=new Map();
try{await execFileAsync('C:\\Program Files\\WinRAR\\UnRAR.exe',['x','-y','C:\\Users\\danie\\Downloads\\Fotos-MS-900x900.rar',`${temp}\\`]);const all=await walk(temp);const products=new Map();for(const row of rows){if(!products.has(row.productId))products.set(row.productId,[]);products.get(row.productId).push(row)}
for(const [productId,items] of products){console.error(`PROCESSANDO ${productId} (${items.length})`);const productImages=[];for(const item of items){let media=mediaByFile.get(item.file);if(!media){const file=all.find(p=>path.basename(p)===item.file);if(!file)throw Error(`Arquivo não encontrado: ${item.file}`);const form=new FormData();form.append('file',new Blob([await fs.readFile(file)],{type:'image/webp'}),item.file);form.append('title',item.file.replace(/\.webp$/i,''));const uploaded=await api(`${base}/wp/v2/media`,{method:'POST',headers:{Authorization:wpAuth},body:form});media={id:uploaded.id};mediaByFile.set(item.file,media)}if(item.type==='product')productImages.push(media)}await api(`${woo}/products/${productId}`,{method:'PUT',headers:{Authorization:wooAuth,'Content-Type':'application/json'},body:JSON.stringify({images:productImages.length?productImages:items.filter(x=>x.type==='product').map(()=>null)})});for(const item of items.filter(x=>x.type==='variation'))await api(`${woo}/products/${productId}/variations/${item.variationId}`,{method:'PUT',headers:{Authorization:wooAuth,'Content-Type':'application/json'},body:JSON.stringify({image:mediaByFile.get(item.file)})});console.log(JSON.stringify({productId,images:items.length,variationImages:items.filter(x=>x.type==='variation').length}))}}
finally{await fs.rm(temp,{recursive:true,force:true})}
