(function () {
  "use strict";

  var form = document.getElementById("form-conta");
  var status = document.getElementById("form-status");
  var senha = document.getElementById("senha");
  var confirmar = document.getElementById("confirmar-senha");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (senha.value.length < 6) {
        status.className = "form-status show error";
        status.textContent = "A palavra-passe deve ter pelo menos 6 caracteres.";
        return;
      }
      if (senha.value !== confirmar.value) {
        status.className = "form-status show error";
        status.textContent = "As palavras-passe não coincidem.";
        return;
      }
      form.reset();
      status.className = "form-status show success";
      status.innerHTML =
        "Conta criada com sucesso! Bem-vindo(a) ao LevaFacil. " +
        "Receberá um e-mail com os próximos passos. " +
        '<a class="btn btn-primary btn-sm" href="index.html">Voltar ao início</a>';
      status.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
})();
