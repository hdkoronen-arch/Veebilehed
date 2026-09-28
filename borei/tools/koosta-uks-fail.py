#!/usr/bin/env python3
"""Paneb borei/ lehed, CSS-i ja JS-i ühte iseseisvasse HTML-faili (#-linkidega marsruutimine)."""
import re, os, collections

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(SRC, "borei-koik-lehed.html")
PAGES = ["index", "teenused", "broneeri", "galerii", "meist", "kinkekaart", "kkk", "kontakt", "privaatsus"]
SLUG = {p: ("avaleht" if p == "index" else p) for p in PAGES}

def read(p): return open(os.path.join(SRC, p), encoding="utf-8").read()

index = read("index.html")
head_fonts = re.search(r'(<link rel="preconnect".*?rel="stylesheet">)\n<link rel="stylesheet"', index, re.S).group(1)
icon = re.search(r'(<link rel="icon"[^>]*>)', index).group(1)
chrome_top = re.search(r"<body>\n(.*?)<main id=\"sisu\">", index, re.S).group(1)
chrome_bot = re.search(r"</main>\n(.*?)<script src=", index, re.S).group(1)

titles, descs, bodies = {}, {}, []
for p in PAGES:
    html = read(p + ".html")
    titles[p] = re.search(r"<title>(.*?)</title>", html).group(1)
    descs[p] = re.search(r'<meta name="description" content="(.*?)">', html).group(1)
    main = re.search(r'<main id="sisu">\n(.*?)\n</main>', html, re.S).group(1)
    if p == "kkk":  # lehesisesed ankrud: #teema -> #kkk:teema
        main = re.sub(r'href="#(broneerimine|teenused|tasumine|lapsed)"', r'href="#kkk:\1"', main)
    bodies.append(f'<div class="page" data-page="{SLUG[p]}"{"" if p == "index" else " hidden"}>\n{main}\n</div>')

def relink(s):
    s = re.sub(r'href="(index|teenused|broneeri|galerii|meist|kinkekaart|kkk|kontakt|privaatsus)\.html(\?[^"#]*)?"',
               lambda m: f'href="#{SLUG[m.group(1)]}{m.group(2) or ""}"', s)
    return s.replace(' aria-current="page"', "")

body = relink(chrome_top) + '<main id="sisu">\n' + relink("\n".join(bodies)) + "\n</main>\n" + relink(chrome_bot)
assert ".html" not in re.sub(r'https?://[^"]+', "", body), "jäi .html link"

ids = collections.Counter(re.findall(r'\sid="([^"]+)"', body))
dups = [k for k, v in ids.items() if v > 1]
assert not dups, dups

css = read("assets/css/style.css")
js = read("assets/js/main.js")
old = '''    var pre = new URLSearchParams(location.search).get("teenus");
    if (pre && svc(pre)) {
      var r = $('input[name="service"][value="' + pre + '"]', bk);
      if (r) { r.checked = true; state.service = pre; markChecked("service"); }
    }'''
new = '''    window.boreiSelectService = function (pre) {
      if (!pre || !svc(pre) || !$("#bk-done").hidden) return;
      var r = $('input[name="service"][value="' + pre + '"]', bk);
      if (r) { r.checked = true; state.service = pre; state.time = null; markChecked("service"); renderSlots(); update(); }
    };'''
assert old in js
js = js.replace(old, new)

meta = {SLUG[p]: [titles[p], descs[p]] for p in PAGES}
router = '''
/* Ühe faili marsruutija: #leht, #leht?param=vaartus, #leht:ankur */
(function () {
  "use strict";
  var META = %s;
  var pages = Array.prototype.slice.call(document.querySelectorAll(".page[data-page]"));
  var current = null;
  function route(hash) {
    var h = decodeURIComponent(String(hash == null ? location.hash : hash).replace(/^#/, ""));
    var m = h.match(/^([a-z-]+)(?:\\?([^:]*))?(?::(.+))?$/);
    var name = m && META[m[1]] ? m[1] : null;
    if (!name) {
      var el = h && document.getElementById(h);
      if (el) { el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: true }); el.scrollIntoView(); return; }
      if (current) return;
      name = "avaleht";
    }
    var changed = name !== current;
    current = name;
    pages.forEach(function (p) { p.hidden = p.getAttribute("data-page") !== name; });
    document.querySelectorAll('.main-nav a, .mobile-nav a').forEach(function (a) {
      if (a.getAttribute("href").split("?")[0] === "#" + name) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    document.title = META[name][0];
    var d = document.querySelector('meta[name="description"]'); if (d) d.setAttribute("content", META[name][1]);
    var mn = document.querySelector(".mobile-nav.open .close"); if (mn) mn.click();
    var q = new URLSearchParams(m && m[2] || "");
    if (name === "broneeri" && q.get("teenus") && window.boreiSelectService) window.boreiSelectService(q.get("teenus"));
    var anchor = m && m[3] && document.getElementById(m[3]);
    if (anchor) anchor.scrollIntoView();
    else if (changed) window.scrollTo(0, 0);
    document.querySelectorAll('.page:not([hidden]) .reveal').forEach(function (r) {
      var b = r.getBoundingClientRect(); if (b.top < window.innerHeight) r.classList.add("in");
    });
  }
  window.addEventListener("hashchange", function () { route(); });
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var href = a.getAttribute("href");
    e.preventDefault();
    try { history.pushState(null, "", href); } catch (err) { /* liivakastis ei pruugi lubada */ }
    route(href);
  });
  route();
})();
''' % __import__("json").dumps(meta, ensure_ascii=False)

html = f'''<!doctype html>
<html lang="et">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{titles["index"]}</title>
<meta name="description" content="{descs["index"]}">
<meta name="theme-color" content="#ebe7df">
{icon}
{head_fonts}
<style>
{css}
</style>
</head>
<body>
{body}<script>
{js}
{router}</script>
</body>
</html>
'''
open(OUT, "w", encoding="utf-8").write(html)
print(OUT, len(html) // 1024, "KB")
