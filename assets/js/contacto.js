(function () {
  "use strict";

  var form = document.getElementById("form-contacto");
  var status = document.getElementById("form-status");
  var assunto = document.getElementById("assunto");

  var params = new URLSearchParams(window.location.search);
  var paramAssunto = params.get("assunto");
  var paramEntidade = params.get("transportador") || params.get("fornecedor");

  if (assunto && paramAssunto) {
    assunto.value = paramEntidade
      ? paramAssunto + ": " + paramEntidade
      : paramAssunto;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      form.reset();
      status.className = "form-status show success";
      status.textContent =
        "Mensagem enviada com sucesso! A nossa equipa responderá em breve.";
      status.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
})();
