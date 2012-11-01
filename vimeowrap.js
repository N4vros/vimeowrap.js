(function(e){var i={};var t=function(e){var n;if(e.nodeType){n=e}else if(typeof e==="string"){n=document.getElementById(e)}if(n){var a=i[n.id];if(a){return a}else{return i[n.id]=new t.api(n)}}return null};t.api=function(e){var i=this,n=null,a=null;this.container=e;this.id=e.id;this.display=null;this.iframe=null;this.player=null;this.config=null;this.plugins={};this.events={playerReady:new t.signal,playlist:new t.signal,playlistItem:new t.signal};this.setup=function(e){var i={width:480,height:280,color:"00adef",repeat:"none",item:0,api:true,player_id:t.utils.uniqueId("player_")};a=t.utils.extend(i,e);this.config=a;l();var n=a.height;var s=0;for(var o in a.plugins){if(typeof t[o]==="function"){this.plugins[o]=new t[o](this,a.plugins[o]);this.plugins[o].config["y"]=n;n+=this.plugins[o].config["height"]||0;if(this.plugins[o].config["position"]==="top"){this.plugins[o].config["y"]=s;s+=this.plugins[o].config["height"]}this.plugins[o].setup()}}t.utils.css(this.container,{width:a.width,height:n});t.utils.css(this.display,{top:s});this.events.playlist.add(r);var u=new t.playlistloader(this);u.load(a.urls);return this};function r(e){n=e;var t=n[a.item];i.events.playlistItem.dispatch(t);s(t.url)}function l(){i.container.innerHTML="";t.utils.css(i.container,{position:"relative"});i.display=document.createElement("div");i.display.id=i.id+"_display";i.container.appendChild(i.display);t.utils.css(i.display,{width:a.width,height:a.height,position:"absolute",background:"#000000"})}function s(e){t.utils.jsonp("http://vimeo.com/api/oembed.json",o({url:e}),function(e){var n=document.createElement("div");n.innerHTML=e.html;i.iframe=n.children[0];i.iframe.id=a.player_id;t.utils.css(i.iframe,{position:"absolute",display:"none"});var r=function(){t.utils.css(i.iframe,{display:"block"})};if(i.iframe.attachEvent){i.iframe.attachEvent("onload",r)}else{i.iframe.onload=r}t.utils.prepend(i.iframe,i.display);t.Froogaloop(i.iframe.id).addEvent("ready",function(){i.player=t.Froogaloop(i.iframe.id);i.events.playerReady.dispatch(i.player);i.player.addEvent("finish",u)})})}function o(e){var i=["url","width","maxwidth","height","maxheight","byline","title","portrait","color","callback","autoplay","loop","xhtml","api","wmode","iframe","player_id"];for(var t=0;t<i.length;t++){var n=i[t];if(a.hasOwnProperty(n)){e[n]=a[n]}}return e}function u(e){var t;switch(a.repeat){case"list":t=a.item+1;if(t<n.length){i.playlistItem(t,true)}break;case"always":t=a.item+1;if(t>=n.length){t=0}i.playlistItem(t,true);break;case"single":i.play();break}}this.playlistItem=function(e,i){a.item=e;this.pause();t.utils.css(this.iframe,{display:"none"});if(typeof i==="boolean"){a.autoplay=i}var r=n[e];var l="http://player.vimeo.com/video/"+r.id+"?";var s=["byline","title","portrait","color","autoplay","loop","api","player_id"];for(var o=0;o<s.length;o++){var u=s[o];if(a.hasOwnProperty(u)){var f=a[u];if(typeof f==="boolean")f=f?1:0;l+=encodeURIComponent(u)+"="+encodeURIComponent(f)+"&"}}if(this.iframe){this.iframe.src=l.slice(0,-1)}this.events.playlistItem.dispatch(r)};this.playlistNext=function(e){var i=a.item+1;if(i>=n.length){i=0}this.playlistItem(i,e)};this.playlistPrev=function(e){var i=a.item-1;if(i<0){i=n.length-1}this.playlistItem(i,e)};this.play=function(){if(this.player){this.player.api("paused",function(e,t){if(e===true)i.player.api("play")})}};this.pause=function(){if(this.player){this.player.api("paused",function(e,t){if(e===false)i.player.api("pause")})}};this.onPlay=function(e){if(this.player)this.player.addEvent("play",e)};this.onPause=function(e){if(this.player)this.player.addEvent("pause",e)};this.onFinish=function(e){if(this.player)this.player.addEvent("finish",e)};this.getPlugin=function(e){return this.plugins[e]}};e.vimeowrap=t})(window);(function(e){e.playlistloader=function(i){var t=this;var n=0;var a=[];this.load=function(e){t.list=r(e);l();return a};function r(e){for(var i=0;i<e.length;i++){var t="vimeo.com/api/v2/";e[i]=e[i].replace(/vimeo.com\/(\d+)$/i,t+"video/$1.json");e[i]=e[i].replace(/vimeo.com\/([A-Z0-9]+)$/i,t+"$1/videos.json");e[i]=e[i].replace(/vimeo.com\/groups\/([A-Z0-9]+)$/i,t+"group/$1/videos.json");e[i]=e[i].replace(/vimeo.com\/channels\/([A-Z0-9]+)$/i,t+"channel/$1/videos.json");e[i]=e[i].replace(/vimeo.com\/album\/([A-Z0-9]+)$/i,t+"album/$1/videos.json")}return e}function l(){e.utils.jsonp(t.list[n++],{},s)}function s(e){a=a.concat(e);if(n<t.list.length){l()}else{i.events.playlist.dispatch(a);i.events.playlist.remove()}}}})(vimeowrap);(function(e){e.utils=function(){};e.utils.jsonp=function(i,t,n){var a="?";t=t||{};for(var r in t){if(t.hasOwnProperty(r)){a+=encodeURIComponent(r)+"="+encodeURIComponent(t[r])+"&"}}var l=e.utils.uniqueId("json_call");window[l]=function(e){n(e);window[l]=null};var s=document.createElement("script");s.src=i+a+"callback="+l;s.async=true;s.onload=s.onreadystatechange=function(){if(!this.readyState||this.readyState==="loaded"||this.readyState==="complete"){s.onload=s.onreadystatechange=null;if(s&&s.parentNode){s.parentNode.removeChild(s)}}};var o=document.head||document.getElementsByTagName("head")[0]||document.documentElement;o.insertBefore(s,o.firstChild)};e.utils.extend=function(e,i){for(var t in i){if(i[t]&&i[t].constructor&&i[t].constructor===Object){e[t]=e[t]||{};arguments.callee(e[t],i[t])}else{e[t]=i[t]}}return e};e.utils.css=function(e,i,t){if(e){for(var n in i){try{if(typeof i[n]==="undefined"){continue}else if(typeof i[n]=="number"&&!(n=="zIndex"||n=="opacity")){if(isNaN(i[n])){continue}i[n]=Math.ceil(i[n])+"px"}e.style[n]=i[n]}catch(a){}}}};e.utils.prepend=function(e,i){if(i.firstChild){i.insertBefore(e,i.firstChild)}else{i.appendChild(e)}};var i=0;e.utils.uniqueId=function(e){var t=i++;return e?e+t:t}})(vimeowrap);if(!Array.indexOf){Array.prototype.indexOf=function(e){for(var i=0;i<this.length;i++){if(this[i]==e){return i}}return-1}}String.prototype.populate=function(e,i){return this.replace(/\{\{\s*([^|\s}]+)\|?([^\s}]*)\s*\}\}/g,function(t,n,a){var r=e[n];if(typeof r!=="undefined"){if(i&&a){var l=a.split("|");for(var s=0;s<l.length;s++){var o=l[s].split(":")[0];var u=l[s].split(":")[1];var f=u?u.split(","):[];f.unshift(r);if(typeof i[o]==="function"){r=i[o].apply(r,f)}}}return r}else{return t}})};(function(e){e.signal=function(){var e=[];this.add=function(i){e.push(i)};this.dispatch=function(){var i=Array.prototype.slice.call(arguments);for(var t=0;t<e.length;t++){if(typeof e[t]==="function"){e[t].apply(this,i)}}};this.remove=function(i){if(i){for(var t=0;t<e.length;t++){if(e[t]===i){e.splice(t,1);t--}}}else{e=[]}}}})(vimeowrap);(function(e){function i(e){return new i.fn.init(e)}var t={},n=false,a=false,r=Array.prototype.slice,l="";i.fn=i.prototype={element:null,init:function(e){if(typeof e==="string"){e=document.getElementById(e)}this.element=e;l=c(this.element.getAttribute("src"));return this},api:function(e,i){if(!this.element||!e){return false}var t=this,n=t.element,a=n.id!==""?n.id:null,r=!d(i)?i:null,l=d(i)?i:null;if(l){u(e,l,a)}s(e,r,n);return t},addEvent:function(e,i){if(!this.element){return false}var t=this,n=t.element,r=n.id!==""?n.id:null;u(e,i,r);if(e!="ready"){s("addEventListener",e,n)}else if(e=="ready"&&a){i.call(null,r)}return t},removeEvent:function(e){if(!this.element){return false}var i=this,t=i.element,n=t.id!==""?t.id:null,a=p(e,n);if(e!="ready"&&a){s("removeEventListener",e,t)}}};function s(e,i,t){if(!t.contentWindow.postMessage){return false}var n=t.getAttribute("src").split("?")[0],a=JSON.stringify({method:e,value:i});if(n.substr(0,2)==="//"){n=window.location.protocol+n}t.contentWindow.postMessage(a,n)}function o(e){var i,t;try{i=JSON.parse(e.data);t=i.event||i.method}catch(n){}if(t=="ready"&&!a){a=true}if(typeof i==="undefined"){return false}if(e.origin!=l){return false}var r=i.value,s=i.data,o=o===""?null:i.player_id,u=f(t,o),p=[];if(!u){return false}if(r!==undefined){p.push(r)}if(s){p.push(s)}if(o){p.push(o)}return p.length>0?u.apply(null,p):u.call()}function u(e,i,n){if(n){if(!t[n]){t[n]={}}t[n][e]=i}else{t[e]=i}}function f(e,i){if(i){return t[i][e]}else{return t[e]}}function p(e,i){if(i&&t[i]){if(!t[i][e]){return false}t[i][e]=null}else{if(!t[e]){return false}t[e]=null}return true}function c(e){if(e.substr(0,2)==="//"){e=window.location.protocol+e}var i=e.split("/"),t="";for(var n=0,a=i.length;n<a;n++){if(n<3){t+=i[n]}else{break}if(n<2){t+="/"}}return t}function d(e){return!!(e&&e.constructor&&e.call&&e.apply)}function h(e){return toString.call(e)==="[object Array]"}i.fn.init.prototype=i.fn;if(window.addEventListener){window.addEventListener("message",o,false)}else{window.attachEvent("onmessage",o)}return e.Froogaloop=e.$f=i})(vimeowrap)