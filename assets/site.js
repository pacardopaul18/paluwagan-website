/* Paluwagan web - vanilla interactivity. No dependencies. */
(function(){
  "use strict";
  var MINUS = String.fromCharCode(8722); /* minus sign, per glyph convention */

  /* ================= CONFIG ================= */
  /* Publishable/anon key is public-safe (RLS enforces security). Paste yours:
     Supabase > Settings > API > Project API keys > "anon"/"publishable". */
  var PALUWAGAN = {
    url: "https://fpmftflbtcptlfaxracc.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwbWZ0ZmxidGNwdGxmYXhyYWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMzI3NDQsImV4cCI6MjA5ODcwODc0NH0.aOu1C1oc4dzfb4N2u6_xE_fh-KVPGjWA9GWsfDq2-pI"
  };
  function configured(){
    return PALUWAGAN.anonKey && PALUWAGAN.anonKey.indexOf("PASTE_") !== 0;
  }
  /* POST a capture row via PostgREST. return=minimal keeps SELECT unnecessary (list stays private). */
  function postCapture(table, payload){
    if(!configured()){ return Promise.resolve({ ok:true, stub:true }); } /* preview: don't block UX */
    return fetch(PALUWAGAN.url + "/rest/v1/" + table, {
      method: "POST",
      headers: {
        "apikey": PALUWAGAN.anonKey,
        "Authorization": "Bearer " + PALUWAGAN.anonKey,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(payload)
    }).then(function(res){
      /* 201/200 created; 409 = already on the list -> treat both as success */
      return { ok: res.ok || res.status === 409, status: res.status };
    }).catch(function(err){
      return { ok:false, error:err };
    });
  }

  /* ================= FAQ accordion ================= */
  document.addEventListener("click", function(e){
    var btn = e.target.closest && e.target.closest(".faq-q");
    if(!btn) return;
    var panel = btn.closest("div").querySelector(".faq-a");
    var sign  = btn.querySelector(".faq-sign");
    var open  = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", open ? "false" : "true");
    if(panel){ if(open){ panel.setAttribute("hidden",""); } else { panel.removeAttribute("hidden"); } }
    if(sign){ sign.textContent = open ? "+" : MINUS; }
  });

  /* ================= form helpers ================= */
  function val(scope, sel){ var el = scope.querySelector(sel); return el ? el.value.trim() : ""; }
  function emailIn(scope){ return val(scope, 'input[type=email]') || val(scope, 'input[name*=mail i]'); }
  function nameIn(scope){ return val(scope, 'input[name*=name i]') || val(scope, 'input[type=text]'); }
  function messageIn(scope){ return val(scope, 'textarea'); }
  function phoneIn(scope){ return val(scope, 'input[type=tel]'); }
  function normPhone(raw){ var s=(raw||"").replace(/[\s\-()]/g,""); if(/^09\d{9}$/.test(s)) return "+63"+s.slice(1); if(/^\+639\d{9}$/.test(s)) return s; return null; }
  function showErr(form, msg){
    var e = form.querySelector(".js-err");
    if(!e){
      e = document.createElement("p");
      e.className = "js-err"; e.setAttribute("role","alert");
      e.style.cssText = "margin:10px 0 0;font-size:13px;color:var(--danger)";
      form.appendChild(e);
    }
    e.textContent = msg; e.hidden = false;
  }
  function clearErr(form){ var e = form.querySelector(".js-err"); if(e){ e.hidden = true; } }

  document.addEventListener("DOMContentLoaded", function(){
    var forms = [].slice.call(document.querySelectorAll(".js-form"));
    /* honeypot: a hidden field bots tend to fill; humans never see it */
    forms.forEach(function(form){
      var hp = document.createElement("input");
      hp.type = "text"; hp.name = "website"; hp.className = "js-hp";
      hp.tabIndex = -1; hp.autocomplete = "off"; hp.setAttribute("aria-hidden","true");
      hp.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;opacity:0";
      form.appendChild(hp);
    });
    var waitlistForms = forms.filter(function(f){ return !f.querySelector("textarea"); });

    document.addEventListener("click", function(e){
      var t = e.target.closest && e.target.closest(".js-form button");
      if(!t) return;
      var form = t.closest(".js-form");
      if(!form) return;
      e.preventDefault();
      clearErr(form);

      var hp = form.querySelector(".js-hp");
      var done = form.parentElement.querySelector(".js-done");
      var isContact = !!form.querySelector("textarea");
      var email = emailIn(form);

      var phone = null;
      if(isContact){
        if(!email){ showErr(form, "Please enter your email."); return; }
        if(!messageIn(form)){ showErr(form, "Please add a short message."); return; }
      } else {
        var praw = phoneIn(form);
        phone = praw ? normPhone(praw) : null;
        if(praw && !phone){ showErr(form, "Enter a valid PH mobile number (09XXXXXXXXX or +63XXXXXXXXX)."); return; }
        if(!email && !phone){ showErr(form, "Enter your email or phone number to join."); return; }
      }
      var consentEl = form.querySelector('input[name="consent"]');
      if(consentEl && !consentEl.checked){ showErr(form, "Please tick the box to agree to the Privacy Policy."); return; }

      function succeed(status){
        if(!done) return;
        var echo = done.querySelectorAll(".js-echo-email");
        for(var i=0;i<echo.length;i++){ echo[i].textContent = email; }
        if(!email && phone){
          var msg = done.querySelector(".js-ok-msg"); if(msg){ msg.innerHTML = "We&#39;ll text <strong>" + phone + "</strong> the moment Paluwagan opens for early access."; }
          var ih = done.querySelector(".js-inbox-hint"); if(ih){ ih.setAttribute("hidden",""); }
        }
        var nm = done.querySelector(".js-name");
        if(nm){ var n = nameIn(form); nm.textContent = n ? n.split(/\s+/)[0] : "kaibigan"; }
        if(status === 409){
          var ti = done.querySelector(".js-ok-title"); if(ti){ ti.textContent = "You're already on the list!"; }
          var so = done.querySelector(".js-socials"); if(so){ so.removeAttribute("hidden"); }
        }
        form.setAttribute("hidden","");
        done.removeAttribute("hidden");
        var f = done.querySelector("h1,h2,h3,[tabindex],button,a");
        if(f){ f.setAttribute("tabindex","-1"); f.focus(); }
      }

      /* honeypot tripped -> silently pretend success, send nothing */
      if(hp && hp.value){ succeed(); return; }

      var table, payload;
      if(isContact){
        table = "paluwagan_web_contact";
        payload = { name: nameIn(form) || null, email: email, message: messageIn(form), source: "contact" };
      } else {
        table = "paluwagan_web_waitlist";
        var idx = waitlistForms.indexOf(form);
        payload = { email: email || null, phone: phone || null, source: idx <= 0 ? "landing_hero" : "landing_bottom" };
      }

      t.disabled = true;
      postCapture(table, payload).then(function(r){
        t.disabled = false;
        if(r.ok){ succeed(r.status); }
        else { showErr(form, "Sorry, something went wrong. Please try again in a moment."); }
      });
    });
  });

  /* ================= mobile nav ================= */
  document.addEventListener("DOMContentLoaded", function(){
    var links = document.querySelector(".pl-navlinks, .plh-links");
    if(!links) return;
    var header = links.closest("header") || links.parentElement;
    if(getComputedStyle(header).position === "static"){ header.style.position = "relative"; }
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "mnav-btn"; btn.setAttribute("aria-expanded","false");
    btn.setAttribute("aria-label","Open menu"); btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="17" x2="20" y2="17"></line></svg>';
    var panel = document.createElement("nav");
    panel.className = "mnav-panel"; panel.setAttribute("aria-label","Site");
    var as = links.querySelectorAll("a");
    for(var i=0;i<as.length;i++){
      var a = document.createElement("a"); a.href = as[i].getAttribute("href");
      a.textContent = as[i].textContent.trim(); panel.appendChild(a);
    }
    function mnavSet(open){
      panel.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false"); btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    btn.addEventListener("click", function(e){ e.stopPropagation(); mnavSet(!panel.classList.contains("open")); });
    document.addEventListener("keydown", function(e){ if(e.key === "Escape" && panel.classList.contains("open")){ mnavSet(false); btn.focus(); } });
    document.addEventListener("click", function(e){ if(panel.classList.contains("open") && !panel.contains(e.target) && e.target !== btn){ mnavSet(false); } });
    panel.addEventListener("click", function(e){ if(e.target.tagName === "A"){ mnavSet(false); } });
    links.parentNode.insertBefore(btn, links.nextSibling);
    header.appendChild(panel);
  });
})();
