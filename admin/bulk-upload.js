/*
 * NestNeev CMS helper: bulk photo upload for the Photos list.
 *
 * Why this exists: Decap's media library only uploads the FIRST file you pick
 * (its file input has no "multiple") and each list item takes exactly one
 * image, so adding 10 photos meant 10 separate rounds of
 * Add photo -> Choose an image -> Upload -> pick file -> Choose selected.
 *
 * What it does (only when the media library is opened from an EMPTY photo slot):
 *   1. lets the file picker select many files,
 *   2. uploads them one after another through Decap's own uploader,
 *   3. then adds every uploaded photo to the listing, one list entry each,
 *      in the order they were chosen.
 * If the library is opened from a photo that already has an image ("Choose
 * different image"), it only uploads - nothing is replaced automatically.
 * Single-file uploads behave exactly as before. Pinned to Decap 3.16.3.
 */
(function () {
  "use strict";
  var busy = false, note = null, lastChooseText = "";

  /* ---------- tiny helpers ---------- */
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function waitFor(fn, timeout, label) {
    return new Promise(function (resolve, reject) {
      var t0 = Date.now();
      (function poll() {
        var v; try { v = fn(); } catch (e) { v = null; }
        if (v) return resolve(v);
        if (Date.now() - t0 > (timeout || 15000)) return reject(new Error("Timed out waiting for " + (label || "the page")));
        setTimeout(poll, 150);
      })();
    });
  }
  function buttons() { return Array.prototype.slice.call(document.querySelectorAll("button")); }
  function buttonByText(re) { return buttons().filter(function (b) { return re.test(b.textContent.trim()); }); }
  function modalOpen() { return buttonByText(/^Choose selected$/).length > 0; }
  function cardNames() {
    return Array.prototype.map.call(document.querySelectorAll('p[class*="CardText"]'), function (p) { return p.textContent.trim(); });
  }

  function say(text, done) {
    if (!note) {
      note = document.createElement("div");
      note.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:2147483647;background:#0B2545;color:#fff;" +
        "padding:10px 16px;border-radius:8px;font:600 14px system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.3);max-width:360px;";
      document.body.appendChild(note);
    }
    note.textContent = text;
    note.style.display = "block";
    if (note._t) clearTimeout(note._t);
    if (done) note._t = setTimeout(function () { note.style.display = "none"; }, 7000);
  }

  /* ---------- 1) multi-select in the OS picker ---------- */
  function enableMultiple() {
    var inputs = document.querySelectorAll(".nc-fileUploadButton input[type=file]");
    for (var i = 0; i < inputs.length; i++) { if (!inputs[i].multiple) inputs[i].multiple = true; }
  }
  enableMultiple();
  new MutationObserver(enableMultiple).observe(document.documentElement, { childList: true, subtree: true });

  // Remember which button opened the library ("Choose an image" = empty slot).
  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest && e.target.closest("button");
    if (b) { var t = b.textContent.trim(); if (/^Choose (an image|different image)$/.test(t)) lastChooseText = t; }
  }, true);

  /* ---------- 2) upload files one at a time through Decap ---------- */
  function waitUntilCleared(input) {
    return waitFor(function () { return !input.files || input.files.length === 0; }, 180000, "an upload to finish").catch(function () {});
  }
  async function uploadAll(input, files) {
    for (var i = 0; i < files.length; i++) {
      say("Uploading photo " + (i + 1) + " of " + files.length + "… please keep this page open");
      var dt = new DataTransfer();
      dt.items.add(files[i]);
      input.files = dt.files;
      var ev = new Event("change", { bubbles: true });
      ev.__bulkReplay = true;
      input.dispatchEvent(ev);
      await waitUntilCleared(input);
    }
  }

  /* ---------- 3) put the uploaded photos into the listing ---------- */
  async function pickCard(name) {
    var card = await waitFor(function () {
      var ps = document.querySelectorAll('p[class*="CardText"]');
      for (var i = 0; i < ps.length; i++) if (ps[i].textContent.trim() === name) return ps[i];
      return null;
    }, 10000, "photo " + name);
    card.click();
    await sleep(250);
    var choose = await waitFor(function () { return buttonByText(/^Choose selected$/)[0]; }, 5000, "Choose selected");
    choose.click();
    await waitFor(function () { return !modalOpen(); }, 8000, "the photo picker to close");
    await sleep(350);
  }

  async function addAllToListing(names) {
    // names are oldest -> newest, i.e. the order the files were chosen.
    for (var k = 0; k < names.length; k++) {
      say("Adding photo " + (k + 1) + " of " + names.length + " to the listing…");
      if (k > 0) {
        var before = buttonByText(/^Choose an image$/).length;
        var add = buttonByText(/^Add photos?$/i)[0];
        if (!add) throw new Error("couldn't find the \"Add photos\" button");
        add.click();
        var slots = await waitFor(function () {
          var s = buttonByText(/^Choose an image$/);
          return s.length > before ? s : null;
        }, 8000, "a new photo slot");
        slots[slots.length - 1].click();               // the new entry is added at the end
        await waitFor(modalOpen, 8000, "the photo picker");
        await sleep(400);
      }
      await pickCard(names[k]);
    }
  }

  async function run(input, files) {
    busy = true;
    var autoAdd = lastChooseText === "Choose an image";   // empty slot -> safe to fill automatically
    try {
      var beforeNames = cardNames();
      await uploadAll(input, files);
      await sleep(600);
      var after = cardNames();
      var fresh = after.filter(function (n) { return beforeNames.indexOf(n) === -1; });
      // Newest uploads appear first in the library, so reverse to get choose-order.
      fresh = fresh.slice(0, files.length).reverse();
      if (!autoAdd || fresh.length === 0) {
        say(files.length + " photos uploaded. Tick the one you want and click Choose selected.", true);
      } else {
        await addAllToListing(fresh);
        say("Done - " + fresh.length + " photos added to the listing. Review them, then click Publish.", true);
      }
    } catch (e) {
      say("Stopped: " + (e && e.message ? e.message : e) + ". Photos already uploaded are safe in the library.", true);
    } finally {
      busy = false;
    }
  }

  // Capture phase so we run before Decap's own handler.
  document.addEventListener("change", function (e) {
    var input = e.target;
    if (!input || input.type !== "file" || !input.closest || !input.closest(".nc-fileUploadButton")) return;
    if (e.__bulkReplay) return;                   // our own one-file replay: let Decap handle it
    var files = Array.prototype.slice.call(input.files || []);
    if (files.length < 2) return;                 // single file: normal behaviour
    e.stopImmediatePropagation();
    e.stopPropagation();
    if (busy) return;
    run(input, files);
  }, true);
})();
