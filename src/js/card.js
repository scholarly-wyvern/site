// Recipe card helpers: fitting the text onto the card, and printing it.
//
// A 10×15 cm card is small, and recipes vary in length. Rather than
// designing every card by hand, the text on each side starts at a
// comfortable size and is shrunk in small steps until it fits.

const START_PT = 10; // normal text size on the card
const MIN_PT = 7; // smallest size that's still comfortable to read

// Shrink each card side until its content fits. Returns the sides that
// still don't fit at the smallest size (the publish step reports these).
export function fitRecipeCard() {
  const tooLong = [];
  for (const face of document.querySelectorAll("[data-card-face]")) {
    const area = face.querySelector(".rc-fit");
    let size = START_PT;
    face.style.fontSize = `${size}pt`;
    while (area.scrollHeight > area.clientHeight + 1 && size > MIN_PT) {
      size -= 0.25;
      face.style.fontSize = `${size}pt`;
    }
    if (area.scrollHeight > area.clientHeight + 1) tooLong.push(face.dataset.cardFace);
  }
  return tooLong;
}

// Print just the card: switch the page size to 10×15 cm, show only the
// card, print, then put everything back.
export function printRecipeCard() {
  const pageSize = document.createElement("style");
  pageSize.textContent = "@page { size: 152.4mm 101.6mm; margin: 0; }";
  document.head.append(pageSize);
  document.body.classList.add("printing-card");
  fitRecipeCard();

  window.addEventListener(
    "afterprint",
    () => {
      pageSize.remove();
      document.body.classList.remove("printing-card");
    },
    { once: true },
  );
  window.print();
}

// The publish step calls this to photograph the card for photo printing
window.fitRecipeCard = fitRecipeCard;
