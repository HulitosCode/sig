(function () {
  "use strict";

  var form = document.getElementById("form-fornecedor");
  var status = document.getElementById("form-status");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      form.reset();
      status.className = "form-status show success";
      status.innerHTML =
        "Registo enviado com sucesso! O seu perfil de fornecedor foi recebido. " +
        "A equipa LevaFacil entrará em contacto para confirmar os seus dados. " +
        '<a class="btn btn-primary btn-sm" href="index.html">Voltar ao início</a>';
      status.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
})();
