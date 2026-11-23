(function () {
  'use strict';
  if (!document.body || document.getElementById('mjw')) return;

  /* Add RED once per page. The interface and its styles are shared sitewide. */
  var root = document.createElement('div');
  root.className = 'mjw';
  root.id = 'mjw';
  root.setAttribute('data-state', 'idle');
  root.innerHTML = [
    '<button class="mjw-launch" type="button" aria-label="Chat with RED" aria-expanded="false" aria-controls="mjw-win">',
      '<span class="mjw-lm" data-mark></span><span>Ask RED</span>',
    '</button>',
    '<section class="mjw-win" id="mjw-win" role="dialog" aria-label="Chat with RED, the MJ web designs assistant" hidden>',
      '<div class="mjw-stage">',
        '<div class="mjw-top"><div><b>RED</b><small>MJ web designs AI assistant</small></div><button class="mjw-x" type="button" aria-label="Close">×</button></div>',
        '<div class="mjw-live"><div class="mjw-sl" aria-hidden="true"><i></i><i></i><i></i></div><span class="mjw-mk" data-mark></span></div>',
        '<span class="mjw-st" id="mjw-st">Ready</span>',
      '</div>',
      '<div class="mjw-log" role="log" aria-live="polite"></div>',
      '<div class="mjw-chips"></div>',
      '<form class="mjw-form" autocomplete="off"><input type="text" aria-label="Type your message" placeholder="Type your message" maxlength="300"><button class="mjw-go" type="submit" aria-label="Send">→</button></form>',
      '<p class="mjw-note">RED is an AI and can make mistakes. <a href="https://wa.me/919843176704" target="_blank" rel="noopener noreferrer">Talk to a person</a></p>',
    '</section>'
  ].join('');
  document.body.appendChild(root);

  /* To connect real AI later, set this to your secure server endpoint.
     Never put an AI provider API key in this browser-side file. */
  var AI_ENDPOINT = '';
  var WA = 'https://wa.me/919843176704';
  var launch = root.querySelector('.mjw-launch');
  var win = root.querySelector('.mjw-win');
  var log = root.querySelector('.mjw-log');
  var chipsBox = root.querySelector('.mjw-chips');
  var form = root.querySelector('.mjw-form');
  var input = form.querySelector('input');
  var stEl = root.querySelector('.mjw-st');
  var history = [], flow = null, lead = {};
  var LABELS = { idle: 'Ready', thinking: 'Thinking', replying: 'Here you go' };
  var CHIPS = ['Get a quote', 'Website design', 'Online store', 'Logo and branding', 'Contact'];

  var MARK = '<svg viewBox="0 0 120 120" aria-hidden="true"><rect x="16" y="16" width="100" height="100" fill="#1F3BFF"/><g transform="rotate(-3 56 56)"><rect x="6" y="6" width="100" height="100" fill="#000"/><g fill="none" stroke="#FFD60A" stroke-width="10" stroke-linecap="square"><path d="M22 78V34L38 56L54 34V78"/><path d="M90 34V60A14 14 0 0 1 76 74H70"/></g></g></svg>';
  root.querySelectorAll('[data-mark]').forEach(function (el) { el.innerHTML = MARK; });

  function setState(state) {
    root.setAttribute('data-state', state);
    stEl.textContent = LABELS[state] || LABELS.idle;
  }

  var KB = [
    { k: ['hello', 'hi', 'hey', 'vanakkam', 'வணக்கம்'], a: 'Hi! I’m RED. I can help with websites, online stores, branding and quotes. What do you need?' },
    { k: ['who are you', 'your name', 'name'], a: 'I’m RED, the AI assistant for MJ web designs.' },
    { k: ['price', 'cost', 'rate', 'charge', 'budget', 'how much'], a: 'The price depends on the pages and features you need. Say “get a quote” and I’ll take your details so we can send a clear quote.' },
    { k: ['store', 'ecommerce', 'e-commerce', 'shop', 'sell online', 'cart'], a: 'Yes, we build online stores where customers can browse your products and order online.' },
    { k: ['logo', 'brand', 'identity', 'design'], a: 'We create your logo, colors and fonts so your website, social posts and print pieces all match.' },
    { k: ['video', 'film', 'reel'], a: 'We make short brand films and product videos that show your story and your people.' },
    { k: ['marketing', 'seo', 'google', 'ads', 'social'], a: 'We help customers find you with SEO, social media and campaigns.' },
    { k: ['website', 'web site', 'site', 'web'], a: 'We design fast websites that work well on phones and are easy for visitors to use. Most business websites take a few weeks.' },
    { k: ['how long', 'time', 'days', 'weeks', 'deliver'], a: 'Most business websites take a few weeks, depending on the size of the site and how quickly we receive your content.' },
    { k: ['where', 'location', 'dharmapuri', 'tamil', 'city'], a: 'We work with businesses in Dharmapuri and across Tamil Nadu.' },
    { k: ['contact', 'call', 'phone', 'number', 'whatsapp', 'email', 'mail'], a: 'Phone and WhatsApp: +91 98431 76704. Email: mjwebdesigns.in@gmail.com.', link: [WA, 'Chat on WhatsApp'] }
  ];
  var FALLBACK = { a: 'I’m not sure about that one. The quickest way is to message Mogan directly.', link: [WA, 'Message on WhatsApp'] };

  function localReply(text) {
    var normalized = text.toLowerCase();
    for (var i = 0; i < KB.length; i++) {
      for (var j = 0; j < KB[i].k.length; j++) {
        if (normalized.indexOf(KB[i].k[j]) !== -1) return KB[i];
      }
    }
    return FALLBACK;
  }

  function getReply(text) {
    if (!AI_ENDPOINT) return Promise.resolve(localReply(text));
    return fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: history.slice(-10) })
    })
    .then(function (response) {
      if (!response.ok) throw new Error('Chat service unavailable');
      return response.json();
    })
    .then(function (data) { return { a: data.reply || FALLBACK.a }; })
    .catch(function () { return FALLBACK; });
  }

  function add(text, who, link) {
    var message = document.createElement('div');
    message.className = 'mjw-m ' + (who === 'me' ? 'mjw-me' : 'mjw-bot');
    message.textContent = text;
    if (link) {
      message.appendChild(document.createElement('br'));
      var anchor = document.createElement('a');
      anchor.href = link[0];
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.textContent = link[1];
      message.appendChild(anchor);
    }
    log.appendChild(message);
    log.scrollTop = log.scrollHeight;
  }

  function botSay(text, link) {
    setState('thinking');
    var typing = document.createElement('div');
    typing.className = 'mjw-m mjw-bot mjw-typing';
    typing.setAttribute('aria-label', 'Thinking');
    typing.innerHTML = '<i></i><i></i><i></i>';
    log.appendChild(typing);
    log.scrollTop = log.scrollHeight;
    return new Promise(function (resolve) {
      window.setTimeout(function () {
        typing.remove();
        add(text, 'bot', link);
        history.push({ role: 'assistant', content: text });
        setState('replying');
        window.setTimeout(function () { setState('idle'); }, 900);
        resolve();
      }, 800);
    });
  }

  function flowStep(text) {
    if (flow === 'name') {
      lead.name = text;
      flow = 'phone';
      botSay('Nice to meet you, ' + text + '. What’s your phone number?');
    } else if (flow === 'phone') {
      if (text.replace(/\D/g, '').length < 10) {
        botSay('That doesn’t look like a full phone number. Please type a 10-digit number.');
        return;
      }
      lead.phone = text;
      flow = 'need';
      botSay('What do you need? For example a website, an online store or a logo.');
    } else if (flow === 'need') {
      lead.need = text;
      flow = null;
      var message = 'Hi, I am ' + lead.name + ' (' + lead.phone + '). I need: ' + lead.need;
      botSay('Thanks, ' + lead.name + '! Tap the button to send this to Mogan on WhatsApp. He will reply with ideas and a quote.', [WA + '?text=' + encodeURIComponent(message), 'Send on WhatsApp']);
    }
  }

  function send(text) {
    text = (text || '').trim();
    if (!text) return;
    chipsBox.innerHTML = '';
    add(text, 'me');
    history.push({ role: 'user', content: text });
    if (flow) {
      flowStep(text);
      return;
    }
    if (/get a quote|need a quote|want a quote/i.test(text)) {
      flow = 'name';
      lead = {};
      botSay('Happy to help. What’s your name?');
      return;
    }
    getReply(text).then(function (reply) { botSay(reply.a, reply.link); });
  }

  function addChips() {
    CHIPS.forEach(function (label) {
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.addEventListener('click', function () { send(label); });
      chipsBox.appendChild(button);
    });
  }

  function boot() {
    ['> Starting RED', '> Online'].forEach(function (label, index) {
      window.setTimeout(function () {
        var status = document.createElement('div');
        status.className = 'mjw-sys';
        status.textContent = label;
        log.appendChild(status);
      }, index * 350);
    });
    window.setTimeout(function () {
      botSay('Hi! I’m RED, the MJ web designs assistant. Ask me about websites, online stores, branding or pricing.').then(addChips);
    }, 900);
  }

  function openChat() {
    root.classList.add('open');
    win.hidden = false;
    launch.setAttribute('aria-expanded', 'true');
    if (!log.children.length) boot();
    window.setTimeout(function () { input.focus(); }, 60);
  }

  function closeChat() {
    setState('idle');
    root.classList.remove('open');
    win.hidden = true;
    launch.setAttribute('aria-expanded', 'false');
    launch.focus();
  }

  launch.addEventListener('click', openChat);
  root.querySelector('.mjw-x').addEventListener('click', closeChat);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !win.hidden) closeChat();
  });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    send(input.value);
    input.value = '';
  });
})();