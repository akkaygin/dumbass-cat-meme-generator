function getOrderPostfix(number) {
  const ns = number.toString();
  const nl = ns.length;
  const nch = ns[nl - 1];
  if (nch == '1') {
    return 'st';
  } else if (nch == '2') {
    return 'nd';
  } else if (nch == '3') {
    return 'rd';
  } else {
    return 'th';
  }
}

const longMonths = new Set([0, 2, 4, 6, 7, 9, 11]);
function isNextDayInANewMonth(date) {
  const month = date.getMonth();
  const day = date.getDate();
  if (month == 1) {
    if (year % 4 == 0) {
      return day == 29? true : false;
    } else {
      return day == 28? true : false;
    }
  } else if (longMonths.has(month)) {
    return day == 31? true : false;
  } else {
    return day == 30? true : false;
  }
}

function getNextDate(date) {
  if (isNextDayInANewMonth(date)) {
    const month = date.getMonth() == 11? 1 : date.getMonth() + 1;
    const year = date.getMonth() == 11? date.getYear() + 1 : date.getYear();
    return new Date(year, month + 1);
  } else {
    return new Date(date.getYear(), date.getMonth(), date.getDate() + 1);
  }
}

const monthLUT = {
  0: 'January',
  1: 'February',
  2: 'March',
  3: 'April',
  4: 'May',
  5: 'June',
  6: 'July',
  7: 'August',
  8: 'September',
  9: 'October',
  10: 'November',
  11: 'December'
};

function makeTopText(date) {
  const month = monthLUT[date.getMonth()];
  const day = date.getDate();
  const postfix = getOrderPostfix(day);
  return `Damn it's ${month} ${day}${postfix} already?`;
}

function makeBottomText(date) {
  const nextDate = getNextDate(date);
  const month = monthLUT[nextDate.getMonth()];
  const day = nextDate.getDate();
  const postfix = getOrderPostfix(day);
  return `Whats next, ${month} ${day}${postfix}? Fuck everything.`;
}

let state = 'waiting';

const message = document.getElementById('message');
const previewImg = document.getElementById('previewImg');
const outImg = document.getElementById('outImg');

function generateAutoslop() {
  if (previewImg.style.display == 'none') {
    state = 'errored';
    message.innerText = 'Please get a random cat or upload one.';
    return;
  }
  
  state = 'generating';
  message.innerText = '';

  const canvas = document.createElement('canvas');
  canvas.width = previewImg.width;
  canvas.height = previewImg.height;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(previewImg, 0, 0, previewImg.width, previewImg.height);

  const topText = makeTopText(new Date(Date.now()));
  const bottomText = makeBottomText(new Date(Date.now()));

  // not exact but pretty good, especially when fit to %90
  ctx.font = '1px impact';
  const fontSize = canvas.width * 0.9 / ctx.measureText(bottomText).width;
  
  ctx.font = `${fontSize}px impact`;
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000 2px'
  ctx.fillText(topText, canvas.width/2, canvas.height * 0.1, canvas.width);
  ctx.strokeText(topText, canvas.width/2, canvas.height * 0.1, canvas.width);
  ctx.fillText(bottomText, canvas.width/2, canvas.height * 0.9, canvas.width);
  ctx.strokeText(bottomText, canvas.width/2, canvas.height * 0.9, canvas.width);

  const imgSrc = canvas.toDataURL('image/png');
  outImg.src = imgSrc;
  outImg.style.display = 'block';
  previewImg.style.display = 'none';

  state = 'done';
}

function showCurrentCat() {
  const image = document.getElementById('previewImg');
  image.src = URL.createObjectURL(currentCat);
  image.style.display = 'block';
  currentCatW = image.width;
  currentCatH = image.height;
}

function fetchRandomCat() {
  const apiUrl = 'https://cataas.com/cat';
  fetch(apiUrl).then(response => {
    if (!response.ok) throw new Error('Couldn\'t fetch a silly cat.');
    state = 'loaded';
    currentCat = response;
    showCurrentCat();
  }).catch(error => {
    state = 'errored';
    message.innerText = 'Failed to fetch a random silly cat.';
  });
}

const localCat = document.getElementById('localCat');
localCat.addEventListener('change', () => {
  state = 'loaded';
  currentCat = localCat.files[0];
  showCurrentCat();
});

function reset() {
  state = 'waiting';
  currentCat = null;
  previewImg.style.display = 'none';
  outImg.style.display = 'none';
  message.innerText = '';
}