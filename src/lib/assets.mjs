/**
 * Every printable exists twice: a PNG for screens, boards and image search, and
 * a vector PDF for paper. One naming rule derives the second from the first, so
 * nothing has to carry two paths around.
 *
 * /img/charts/guitar-chord-chart-printable.png -> /pdf/charts/guitar-chord-chart.pdf
 */
export const pdfPath = (imagePath) =>
  imagePath.replace('/img/', '/pdf/').replace(/(-printable)?\.png$/, '.pdf');

export const downloadName = (path) => path.split('/').pop();
