knitRegression <- function(dat, conflevel, filetype, outdir){
  dat <- as.data.frame(dat)
  conflevel <- conflevel/100
  setwd("./R")
  out <- rmarkdown::render("regression.Rmd",
                           output_dir = outdir,
                           output_format = filetype,
                           params = list(set_title="Regression analysis"))
  return(out)
}
