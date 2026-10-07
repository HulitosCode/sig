(function () {
  "use strict";

  var dados = LEVAFACIL.FORNECEDORES || [];
  var grid = document.getElementById("lista-fornecedores");

  function esc(str) {
    var d = document.createElement("div");
    d.textContent = str == null ? "" : String(str);
    return d.innerHTML;
  }

  function renderCard(f) {
    return (
      '<article class="list-card fade-up visible">' +
        '<div class="top">' +
          '<div class="avatar"><i class="bi bi-shop"></i></div>' +
          "<div>" +
            "<h3>" + esc(f.nome) + "</h3>" +
            '<span class="cat-badge">' + esc(f.provincia) + "</span>" +
          "</div>" +
        "</div>" +
        '<div class="details">' +
          "<span><i class='bi bi-box-seam'></i> " + esc(f.produtos) + "</span>" +
          "<span><i class='bi bi-card-list'></i> NIF: " + esc(f.nif) + "</span>" +
        "</div>" +
        '<a class="btn btn-primary btn-sm" href="contacto.html?assunto=Fornecedor&fornecedor=' + encodeURIComponent(f.nome) + '">' +
          '<i class="bi bi-whatsapp"></i> Contactar</a>' +
      "</article>"
    );
  }

  if (grid) {
    grid.innerHTML =
      '<div class="grid-3" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">' +
        dados.map(renderCard).join("") +
      "</div>";
  }
})();
