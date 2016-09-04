{-# LANGUAGE DataKinds #-}
{-# LANGUAGE GADTs #-}
{-# LANGUAGE PartialTypeSignatures #-}
{-# LANGUAGE OverloadedLists #-}
{-# LANGUAGE ScopedTypeVariables #-}
{-# LANGUAGE QuasiQuotes       #-}
{-# LANGUAGE TemplateHaskell   #-}
{-# LANGUAGE ViewPatterns      #-}
{-# LANGUAGE OverloadedStrings, DeriveGeneric #-}
{-# LANGUAGE TypeFamilies      #-}
{-# LANGUAGE  MultiParamTypeClasses #-}
 
import Yesod
import Yesod.Static
import GHC.Generics
import qualified Language.R.Instance as R
import H.Prelude.Interactive
import System.Directory (getTemporaryDirectory)
import FileToBase64
staticFiles "static"
 
data HelloInlineR = HelloInlineR { getStatic :: Static }
 
mkYesod "HelloInlineR" [parseRoutes|
/ HomeR GET
/data DataR PUT
/static StaticR Static getStatic
|]
 
instance Yesod HelloInlineR
 
data Args = Args {
    _dat :: String,
    _conflevel :: Double,
    _filetype :: String
} deriving (Show,Generic)
 
instance FromJSON Args
 
getHomeR :: Handler Html
getHomeR = defaultLayout $ do
  addScript $ StaticR jquery_jquery_1_10_2_min_js
  addScript $ StaticR _PapaParse_papaparse_4_1_2_min_js
  addStylesheet $ StaticR bootstrap_bootstrap_4_0_0_min_css
  addScript $ StaticR bootstrap_bootstrap_4_0_0_min_js
  addScript $ StaticR bootstrap_bootstrap_file_input_js
  addStylesheet $ StaticR css_regression_css
  addStylesheet $ StaticR jqplot_1_0_9_jquery_jqplot_min_css
  addScript $ StaticR jqplot_1_0_9_jquery_jqplot_min_js
  addScript $ StaticR jqplot_1_0_9_plugins_jqplot_canvasAxisLabelRenderer_js
  addScript $ StaticR jqplot_1_0_9_plugins_jqplot_canvasTextRenderer_js
  addScript $ StaticR jqplot_1_0_9_plugins_jqplot_cursor_js
  addScript $ StaticR jqplot_1_0_9_plugins_jqplot_highlighter_js
  addScript $ StaticR jqplot_1_0_9_plugins_jqplot_trendline_js
  addScript $ StaticR js_jsontotable_js
  addScript $ StaticR js_main_js
  addScript $ StaticR jsonTable_jsonTable_js
  toWidget $(whamletFile "index.hamlet")
 
runR :: Args -> IO FilePath
runR (Args dat conflevel filetype) = 
  do
    tmp <- getTemporaryDirectory
    r <- [r|source("R/knitRegression.R")
    knitRegression(jsonlite::fromJSON(dat_hs), conflevel_hs, filetype_hs, tmp_hs)|]
    return $ (fromSomeSEXP r :: FilePath) 
 
putDataR :: Handler String
putDataR = do
    arguments <- requireJsonBody :: Handler Args
    filename <- liftIO $ runR arguments
    base64 <- liftIO $ fileToBase64 filename
    return $ base64
 
main :: IO ()
main = do 
    R.initialize R.defaultConfig
    static@(Static settings) <- static "static"
    warp 3000 $ HelloInlineR static
