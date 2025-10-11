(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    // --- Inject lightweight CSS used by script.js ---
    const css = `
/* Inline errors */
.error {
  color: #c62828;
  font-size: 0.95rem;
  margin-top: 6px;
}
/* Success message */
.form-success {
  color: #0b6623;
  background: #d4edda;
  border-radius: 6px;
  padding: 8px 10px;
  margin-top: 12px;
  font-weight: 600;
}
/* Completed goal row */
.completed {
  background-color: #e8ffea !important;
}
.completed td:first-child {
  text-decoration: line-through;
  opacity: 0.95;
}
/* Avatar hover/focus */
.avatar-hover {
  transform: scale(1.06);
  box-shadow: 0 8px 22px rgba(0,0,0,0.18);
  transition: transform 180ms ease, box-shadow 180ms ease;
}
/* Back to top button */
#backToTop {
  position: fixed;
  right: 18px;
  bottom: 18px;
  display: none;
  padding: 8px 12px;
  border-radius: 999px;
  border: none;
  background: #0b84ff;
  color: #fff;
  cursor: pointer;
  z-index: 9999;
  font-size: 16px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.18);
}
#backToTop.show { display: block; }
`;

    const styleTag = document.createElement("style");
    styleTag.type = "text/css";
    styleTag.appendChild(document.createTextNode(css));
    document.head.appendChild(styleTag);

    // ---------- Utilities ----------
    function createErrorElement(message) {
      const div = document.createElement("div");
      div.className = "error";
      div.setAttribute("role", "alert");
      div.setAttribute("aria-live", "assertive");
      div.textContent = message;
      return div;
    }

    // ---------- Form validation & behaviour ----------
    const form = document.querySelector(".form-container");
    if (form) {
      function clearErrors() {
        form.querySelectorAll(".error").forEach(function (el) {
          el.remove();
        });
        form.querySelectorAll('[aria-invalid="true"]').forEach(function (el) {
          el.removeAttribute("aria-invalid");
        });
      }

      function showError(referenceEl, message) {
        var container = referenceEl;
        if (!container) container = form;
        if (typeof container.closest === "function") {
          container =
            container.closest(".form-row") || container.parentElement || form;
        }

        var existing = container.querySelector(".error");
        if (existing) {
          existing.textContent = message;
          return existing;
        }

        var err = createErrorElement(message);
        container.appendChild(err);

        var focusable = container.querySelector("input,textarea,select,button");
        if (focusable) focusable.setAttribute("aria-invalid", "true");
        return err;
      }

      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        clearErrors();

        var hasError = false;

        // Name
        var fullnameEl = document.getElementById("fullname");
        var fullname = fullnameEl ? fullnameEl.value.trim() : "";
        if (!fullname) {
          showError(fullnameEl, "Tên không được để trống.");
          hasError = true;
        }

        // Email: simple checks without regex to avoid escaping issues
        var emailEl = document.getElementById("email");
        var email = emailEl ? emailEl.value.trim() : "";
        if (!email) {
          showError(emailEl, "Email không được để trống.");
          hasError = true;
        } else if (email.indexOf("@") === -1 || email.indexOf(" ") !== -1) {
          showError(emailEl, "Email không hợp lệ.");
          hasError = true;
        } else {
          // check there is a dot after @ and at least one character between @ and the last dot
          var atPos = email.indexOf("@");
          var lastDot = email.lastIndexOf(".");
          if (lastDot < atPos + 2) {
            showError(emailEl, "Email không hợp lệ.");
            hasError = true;
          }
        }

        // Message (minimum 10 characters)
        var messageEl = document.getElementById("message");
        var message = messageEl ? messageEl.value.trim() : "";
        if (message.length < 10) {
          showError(
            messageEl || (messageEl && messageEl.parentElement) || form,
            "Tin nhắn phải có ít nhất 10 ký tự."
          );
          hasError = true;
        }

        // Gender (required)
        var genderChecked = form.querySelector("input[name=gender]:checked");
        if (!genderChecked) {
          var genderInput = form.querySelector("input[name=gender]");
          var genderContainer = genderInput
            ? genderInput.closest(".form-row") || genderInput.parentElement
            : null;
          showError(genderContainer || form, "Vui lòng chọn giới tính.");
          hasError = true;
        }

        if (hasError) {
          var firstError = form.querySelector(".error");
          if (firstError) {
            var parent = firstError.parentElement;
            var focusTarget = parent.querySelector(
              "input,textarea,select,button"
            );
            if (focusTarget && typeof focusTarget.focus === "function")
              focusTarget.focus();
          }
          return;
        }

        // success
        var existingSuccess = form.querySelector(".form-success");
        if (existingSuccess) existingSuccess.remove();
        var success = document.createElement("div");
        success.className = "form-success";
        success.setAttribute("role", "status");
        success.setAttribute("aria-live", "polite");
        success.textContent = "Gửi thông tin thành công. Cảm ơn bạn!";
        form.appendChild(success);

        form.reset();
      });

      form.addEventListener("input", function (ev) {
        var target = ev.target;
        if (!target) return;
        var row = target.closest(".form-row");
        if (row) {
          var err = row.querySelector(".error");
          if (err) err.remove();
          if (target.hasAttribute("aria-invalid"))
            target.removeAttribute("aria-invalid");
        }
        var success = form.querySelector(".form-success");
        if (success) success.remove();
      });
    }

    // ---------- Goals table: mark completed rows ----------
    (function setupGoalCheckboxes() {
      var goalTable = document.querySelector("#gioithieu table");
      if (!goalTable) return;

      var checkboxes = goalTable.querySelectorAll("input[type=checkbox]");
      Array.prototype.forEach.call(checkboxes, function (cb) {
        var tr = cb.closest("tr");
        if (cb.checked && tr) tr.classList.add("completed");
        cb.addEventListener("change", function () {
          if (tr) tr.classList.toggle("completed", cb.checked);
        });
      });
    })();

    // ---------- Avatar hover / focus effect ----------
    (function avatarHover() {
      var avatar =
        document.querySelector("#gioithieu img[alt]") ||
        document.querySelector("#gioithieu img");
      if (!avatar) return;
      if (!avatar.hasAttribute("tabindex"))
        avatar.setAttribute("tabindex", "0");
      avatar.addEventListener("mouseover", function () {
        avatar.classList.add("avatar-hover");
      });
      avatar.addEventListener("mouseout", function () {
        avatar.classList.remove("avatar-hover");
      });
      avatar.addEventListener("focus", function () {
        avatar.classList.add("avatar-hover");
      });
      avatar.addEventListener("blur", function () {
        avatar.classList.remove("avatar-hover");
      });
    })();

    // ---------- Back to top button ----------
    (function backToTop() {
      var btn = document.createElement("button");
      btn.id = "backToTop";
      btn.type = "button";
      btn.setAttribute("aria-label", "Lên đầu trang");
      btn.title = "Lên đầu trang";
      btn.textContent = "▲";
      document.body.appendChild(btn);

      function checkScroll() {
        if (window.pageYOffset > 200) btn.classList.add("show");
        else btn.classList.remove("show");
      }

      window.addEventListener("scroll", checkScroll, { passive: true });
      checkScroll();

      btn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      btn.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    })();

    // ---------- Smooth scroll for internal links ----------
    (function smoothInternalLinks() {
      var anchors = document.querySelectorAll('a[href^="#"]');
      Array.prototype.forEach.call(anchors, function (a) {
        a.addEventListener("click", function (e) {
          var href = this.getAttribute("href");
          if (!href || href === "#") return;
          var id = href.slice(1);
          var target = document.getElementById(id);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            try {
              history.replaceState(null, "", "#" + id);
            } catch (ex) {}
          }
        });
      });
    })();
  });
})();
