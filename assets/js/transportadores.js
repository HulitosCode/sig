(function () {
  "use strict";

  var dados = LEVAFACIL.TRANSPORTADORES || [];
  var grid = document.getElementById("lista-transportadores");
  var tabsWrap = document.getElementById("filtros-categoria");

  function esc(str) {
    var d = document.createElement("div");
    d.textContent = str == null ? "" : String(str);
    return d.innerHTML;
  }

  function renderCard(t) {
    var provincias = (t.provincias || []).join(", ");
    var icon = LEVAFACIL.ICONES_CATEGORIA[t.categoria] || "bi-truck";
    return (
      '<article class="list-card fade-up visible">' +
        '<div class="top">' +
          '<div class="avatar"><i class="bi ' + esc(icon) + '"></i></div>' +
          '<div>' +
            "<h3>" + esc(t.nome) + "</h3>" +
            '<span class="cat-badge">' + esc(t.categoria) + "</span>" +
          "</div>" +
        "</div>" +
        '<div class="details">' +
          "<span><i class='bi bi-truck-front'></i> " + esc(t.veiculo) + " · Matrícula " + esc(t.matricula) + "</span>" +
          "<span><i class='bi bi-box-seam'></i> Carga máxima: " + esc(t.carga) + "</span>" +
          "<span><i class='bi bi-signpost-split'></i> Rotas: " + esc(provincias) + "</span>" +
          "<span><i class='bi bi-cash-coin'></i> " + esc(t.preco) + "</span>" +
        "</div>" +
        '<span class="avail ' + (t.disponivel ? "avail-yes" : "avail-no") + '">' +
          (t.disponivel ? "Disponível para viagens" : "Indisponível no momento") +
        "</span>" +
        '<a class="btn btn-primary btn-sm" href="contacto.html?assunto=Transporte&transportador=' + encodeURIComponent(t.nome) + '">' +
          '<i class="bi bi-whatsapp"></i> Contactar</a>' +
      "</article>"
    );
  }

  function render(categoria) {
    var lista = categoria && categoria !== "Todas"
      ? dados.filter(function (t) { return t.categoria === categoria; })
      : dados;
    grid.innerHTML = lista.length
      ? '<div class="grid-3" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">' +
          lista.map(renderCard).join("") +
        "</div>"
      : '<p style="text-align:center;color:var(--muted)">Ainda não existem transportadores nesta categoria. Seja o primeiro a registar-se.</p>';
  }

  if (tabsWrap) {
    var categorias = ["Todas"].concat(Object.keys(LEVAFACIL.CATEGORIAS));
    categorias.forEach(function (cat) {
      var btn = document.createElement("button");
      btn.className = "filter-tab" + (cat === "Todas" ? " active" : "");
      btn.textContent = cat;
      btn.type = "button";
      btn.addEventListener("click", function () {
        var ativos = tabsWrap.querySelectorAll(".filter-tab");
        ativos.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        render(cat);
      });
      tabsWrap.appendChild(btn);
    });
  }

  if (grid) {
    render("Todas");
  }
})();
