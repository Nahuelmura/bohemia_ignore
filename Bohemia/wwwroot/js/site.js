// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.







function formatearCantidad(input) {
  if (!input) return;

  input.addEventListener("input", (e) => {
    let cursorPosition = e.target.selectionStart;
    let oldLength = e.target.value.length;

    // Solo números
    let valor = e.target.value.replace(/\D/g, "");

    if (!valor) {
      e.target.value = "";
      return;
    }

    // Formatear con separador de miles
    let formateado = Number(valor).toLocaleString("es-AR");
    e.target.value = formateado;

    // Ajustar cursor
    let newLength = e.target.value.length;
    cursorPosition = cursorPosition + (newLength - oldLength);
    e.target.setSelectionRange(cursorPosition, cursorPosition);
  });

  // Asegurar que al perder el foco esté limpio si está vacío
  input.addEventListener("blur", (e) => {
    if (e.target.value === "0") e.target.value = "";
  });
}

function formatearPrecio(input) {
  if (!input) return;

  let tieneComa = false;

  input.addEventListener("keydown", (e) => {
    const key = e.key;

    // Navegación y borrado
    if (
      ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(key)
    ) {
      return;
    }

    // Coma → activar centavos
    if (key === "," || key === ".") {
      if (tieneComa) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      tieneComa = true;
      input.value += ",";
      return;
    }

    // Solo números
    if (!/^[0-9]$/.test(key)) {
      e.preventDefault();
      return;
    }

    // Limitar centavos a 2
    if (tieneComa) {
      const dec = input.value.split(",")[1] || "";
      if (dec.length >= 2) {
        e.preventDefault();
      }
    }
  });

  input.addEventListener("input", () => {
    tieneComa = input.value.includes(",");
  });

  input.addEventListener("blur", () => {
    let valor = input.value.replace("$", "").trim();
    if (!valor) {
      input.value = "$ 0,00";
      return;
    }

    let [entero, decimal = ""] = valor.split(",");

    entero = entero.replace(/\D/g, "");
    decimal = decimal.replace(/\D/g, "").padEnd(2, "0").slice(0, 2);

    let numero = parseFloat(entero + "." + decimal);

    input.value = numero.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  });

  input.addEventListener("focus", () => {
    if (input.value === "$ 0,00") {
      input.value = "";
      tieneComa = false;
    }
  });
}

function limpiarNumeroSQL(valor, retornarNumero = true) {
  if (!valor) return 0;

  // Eliminar $, espacios y puntos (separador de miles en AR)
  const limpio = valor
    .replace(/\$/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", "."); // Convertir coma decimal en punto para JS

  if (retornarNumero) {
    return parseFloat(limpio) || 0;
  }
  return limpio; // Retorna string con punto
}

function formatearCantidadAR(valor) {
  if (valor == null) return "";
  return Number(valor).toLocaleString("es-AR");
}

function formatearPrecioAR(valor) {
  if (valor == null) return "";
  return Number(valor).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  });
}


