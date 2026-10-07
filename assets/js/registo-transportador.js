(function () {
  "use strict";

  var tipoSelect = document.getElementById("tipo-carro");
  var categoriaPill = document.getElementById("categoria-pill");
  var categoriaTexto = document.getElementById("categoria-texto");
  var form = document.getElementById("form-transportador");
  var status = document.getElementById("form-status");

  function preencherTipos() {
    var keys = Object.keys(LEVAFACIL.CATEGORIAS);
    keys.forEach(function (cat) {
      var grupo = document.createElement("optgroup");
      grupo.label = cat;
      LEVAFACIL.CATEGORIAS[cat].forEach(function (tipo) {
        var opt = document.createElement("option");
        opt.value = tipo;
        opt.textContent = tipo + " (" + cat + ")";
        grupo.appendChild(opt);
      });
      tipoSelect.appendChild(grupo);
    });
  }

  function atualizarCategoria() {
    var tipo = tipoSelect.value;
    if (!tipo) {
      categoriaPill.classList.add("hidden");
      return;
    }
    var cat = LEVAFACIL.CATEGORIA_DE_TIPO(tipo);
    if (cat) {
      categoriaTexto.textContent = "Categoria: " + cat;
      categoriaPill.classList.remove("hidden");
    }
  }

  if (tipoSelect) {
    preencherTipos();
    tipoSelect.addEventListener("change", atualizarCategoria);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (!tipoSelect || !tipoSelect.value) {
        status.className = "form-status show error";
        status.textContent = "Seleccione o tipo de carro.";
        return;
      }
      form.reset();
      if (categoriaPill) categoriaPill.classList.add("hidden");
      status.className = "form-status show success";
      status.innerHTML =
        "Registo enviado com sucesso! A sua candidatura como transportador foi recebida. " +
        "A equipa LevaFacil entrará em contacto para confirmar os seus dados. " +
        '<a class="btn btn-primary btn-sm" href="index.html">Voltar ao início</a>';
      status.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
})();
