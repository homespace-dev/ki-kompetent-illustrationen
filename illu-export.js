/* Zentrale Export-Logik für alle Illustrationen.
   Standard: transparenter Hintergrund. Optional: weiß oder feines Punkt-Raster.
   Hintergrund per ?bg= (Default grid – passt zum Galerie-Default). */
(function(){
  var DOT = "#d9dae1";      // Punktfarbe
  var SP  = 16;             // Rasterabstand (px) – fein
  var R   = 1.05;           // Punktradius (px)

  function nameFor(bg, w){
    return (document.title || "illustration").replace(/[^a-z0-9]+/gi, "-").toLowerCase() + "-" + bg + "-" + w + "px.png";
  }
  function drawGrid(ctx, w, h, scale){
    var sp = SP * scale, r = R * scale;
    ctx.fillStyle = DOT;
    for (var y = sp/2; y < h; y += sp){
      for (var x = sp/2; x < w; x += sp){
        ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
      }
    }
  }
  // Echte Graustufen (Luminanz L = 0.299R+0.587G+0.114B) – Alpha bleibt erhalten.
  function desaturate(canvas){
    var ctx = canvas.getContext("2d");
    var im = ctx.getImageData(0,0,canvas.width,canvas.height);
    var d = im.data;
    for (var i=0;i<d.length;i+=4){
      var l = (0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2] + 0.5) | 0;
      d[i] = d[i+1] = d[i+2] = l;
    }
    ctx.putImageData(im,0,0);
    return canvas;
  }
  async function exportPNG(scale, bg, gray){
    scale = scale || 3; bg = bg || "transparent";
    var node = document.getElementById("capture");
    var canvas = await html2canvas(node, { scale: scale, backgroundColor: null, useCORS: true, logging: false });
    var out = canvas;
    if (bg === "white" || bg === "grid"){
      var m = Math.round(36 * scale);   // Rand: mind. 2 Grid-Punkte (16px) ringsum, Grafik zentriert
      var c = document.createElement("canvas"); c.width = canvas.width + 2*m; c.height = canvas.height + 2*m;
      var ctx = c.getContext("2d");
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,c.width,c.height);
      if (bg === "grid") drawGrid(ctx, c.width, c.height, scale);
      ctx.drawImage(canvas, m, m);
      out = c;
    }
    if (gray) desaturate(out);
    var a = document.createElement("a");
    a.download = nameFor((gray ? "sw-" : "") + bg, Math.round(out.width));
    a.href = out.toDataURL("image/png"); a.click();
  }
  window.__exportPNG = exportPNG;

  var u = new URLSearchParams(location.search);
  var bg = u.get("bg") || "grid";
  var gray = u.get("gray") === "1";
  var swMode = u.get("sw") === "1";

  /* ---- S/W-sichere Palette (gleiche Logik wie sw-palette.js): Farbton+Sättigung halten,
     nur Luminanz gestuft → im Graustufendruck unterscheidbar. Non-destruktiv im DOM. ---- */
  function _hx2rgb(h){h=h.replace('#','');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
  function _rgb2hx(r,g,b){var c=function(x){return Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0');};return ('#'+c(r)+c(g)+c(b)).toUpperCase();}
  function _gL(r,g,b){return 0.299*r+0.587*g+0.114*b;}
  function _rgb2hsl(r,g,b){r/=255;g/=255;b/=255;var mx=Math.max(r,g,b),mn=Math.min(r,g,b),h,s,l=(mx+mn)/2;if(mx===mn){h=s=0;}else{var d=mx-mn;s=l>0.5?d/(2-mx-mn):d/(mx+mn);if(mx===r)h=(g-b)/d+(g<b?6:0);else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h/=6;}return [h,s,l];}
  function _hsl2rgb(h,s,l){var r,g,b;if(s===0){r=g=b=l;}else{var f=function(p,q,t){if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;};var q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;r=f(p,q,h+1/3);g=f(p,q,h);b=f(p,q,h-1/3);}return [r*255,g*255,b*255];}
  function _recolor(hex,t){var rgb=_hx2rgb(hex),hsl=_rgb2hsl(rgb[0],rgb[1],rgb[2]),lo=0,hi=1,i,m,c;for(i=0;i<26;i++){m=(lo+hi)/2;c=_hsl2rgb(hsl[0],hsl[1],m);(_gL(c[0],c[1],c[2])<t)?lo=m:hi=m;}c=_hsl2rgb(hsl[0],hsl[1],(lo+hi)/2);return _rgb2hx(c[0],c[1],c[2]);}
  /* Feste Grauwerte je Palettenfarbe → in JEDER Grafik derselbe Ton in S/W (Aura a1–a5 + Verläufe/Bänder) */
  var _FIXED = {
    '#5174BC':58,'#5D86C9':58,'#6E97D6':66,'#41639E':52,             /* a1 Blau  */
    '#675FB6':77,'#685DBA':77,'#8076C8':84,'#574799':70,'#6A5CB0':80, /* a2 Indigo */
    '#7E5BA4':96,'#8F5E9C':96,'#8C5FAB':96,                          /* a3 Violett */
    '#9F5E92':116,'#A172B0':116,'#AD6097':116,                       /* a4 Purpur */
    '#BD6C85':135,'#C4627E':135,'#CB7C95':140,'#9C4E69':122,'#B0588F':128 /* a5 Rosé */
  };
  function _rgb2hexText(t){return t.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g,function(_,r,g,b){return _rgb2hx(+r,+g,+b);});}
  function _collectHex(){
    var seen={},list=[],i,hx;
    function add(txt){
      txt=_rgb2hexText(txt);
      var m=txt.match(/#[0-9A-Fa-f]{6}/g)||[];for(var k=0;k<m.length;k++){hx=m[k].toUpperCase();if(!seen[hx]){seen[hx]=1;list.push(hx);}}}
    add(document.documentElement.outerHTML);
    for(i=0;i<document.styleSheets.length;i++){var sh=document.styleSheets[i],rules;try{rules=sh.cssRules;}catch(e){continue;}if(!rules)continue;for(var r=0;r<rules.length;r++){add(rules[r].cssText||'');}}
    return list;
  }
  /* pure=true: echte Grauwerte (R=G=B) statt entsättigter Farbtöne → unabhängig von den Luma-Koeffizienten des CSS-Filters */
  function _gray(t){var v=Math.max(0,Math.min(255,Math.round(t))).toString(16).padStart(2,'0');return ('#'+v+v+v).toUpperCase();}
  function _swMap(pure){
    var list=_collectHex(),map={},rest=[];
    var tone=function(hx,t){return pure?_gray(t):_recolor(hx,t);};
    list.forEach(function(hx){ if(_FIXED[hx]!=null) map[hx]=tone(hx,_FIXED[hx]); else rest.push(hx); });
    var acc=rest.filter(function(x){var c=_hx2rgb(x),hsl=_rgb2hsl(c[0],c[1],c[2]),gl=_gL(c[0],c[1],c[2]);return hsl[1]>=0.18&&gl>=60&&gl<=150;});
    acc.sort(function(a,b){return _rgb2hsl.apply(null,_hx2rgb(a))[0]-_rgb2hsl.apply(null,_hx2rgb(b))[0];});
    var n=acc.length,LO=58,HI=135;
    acc.forEach(function(hx,idx){var t=n<=1?96:LO+(HI-LO)*idx/(n-1);map[hx]=tone(hx,t);});
    return map;
  }
  function applySW(){
    var map=_swMap(u.get('gray')==='1');
    if(!Object.keys(map).length) return;
    function rep(s){return _rgb2hexText(s).replace(/#[0-9A-Fa-f]{6}/g,function(x){return map[x.toUpperCase()]||x;});}
    var all=document.querySelectorAll('*'),i,el,st,a,v,attrs=['fill','stroke','stop-color'],k;
    for(i=0;i<all.length;i++){el=all[i];st=el.getAttribute&&el.getAttribute('style');if(st&&/#[0-9A-Fa-f]{6}/.test(st))el.setAttribute('style',rep(st));for(k=0;k<attrs.length;k++){a=attrs[k];v=el.getAttribute&&el.getAttribute(a);if(v&&/#[0-9A-Fa-f]{6}/.test(v))el.setAttribute(a,rep(v));}}
    for(i=0;i<document.styleSheets.length;i++){var sh=document.styleSheets[i],rules;try{rules=sh.cssRules;}catch(e){continue;}if(!rules)continue;for(var r=0;r<rules.length;r++){var rule=rules[r];if(!rule.style)continue;for(var j=0;j<rule.style.length;j++){var prop=rule.style[j],val=rule.style.getPropertyValue(prop);if(/#[0-9A-Fa-f]{6}|rgb\(/.test(val))rule.style.setProperty(prop,rep(val),rule.style.getPropertyPriority(prop));}}}
  }
  if(swMode){ try{ applySW(); }catch(e){} }

  function applyDisplayBg(mode){
    var w = document.querySelector(".wrap"); if (!w) return;
    if (mode === "white"){ w.style.background = "#ffffff"; return; }
    if (mode === "transparent"){
      w.style.backgroundColor = "#ffffff";
      w.style.backgroundImage = "linear-gradient(45deg,#eceef2 25%,transparent 25%),linear-gradient(-45deg,#eceef2 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eceef2 75%),linear-gradient(-45deg,transparent 75%,#eceef2 75%)";
      w.style.backgroundSize = "22px 22px";
      w.style.backgroundPosition = "0 0,0 11px,11px -11px,-11px 0";
      return;
    }
    // grid – feines Punktraster
    w.style.backgroundColor = "#ffffff";
    w.style.backgroundImage = "radial-gradient(circle, " + DOT + " 1px, transparent 1.5px)";
    w.style.backgroundSize = SP + "px " + SP + "px";
    w.style.backgroundPosition = (SP/2) + "px " + (SP/2) + "px";
  }
  applyDisplayBg(bg);
  // S/W-Vorschau auf dem Bildschirm (Export desaturiert ohnehin pixelgenau)
  if (gray){ var cap = document.getElementById("capture"); if (cap) cap.style.filter = "grayscale(1)"; }

  var btn = document.getElementById("downloadBtn");
  if (btn) btn.addEventListener("click", function(){ exportPNG(3, bg, gray); });
  window.addEventListener("message", function(e){
    if (e && e.data && e.data.type === "export") exportPNG(e.data.scale || 3, e.data.bg || bg, e.data.gray != null ? e.data.gray : gray);
  });
  var ex = u.get("export");
  if (ex){ window.addEventListener("load", function(){ setTimeout(function(){ exportPNG(parseFloat(ex) || 3, bg, gray); }, 900); }); }
})();
