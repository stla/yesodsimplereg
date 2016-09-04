{-# LANGUAGE OverloadedStrings #-}

module FileToBase64 where

import qualified Data.Text as T
import qualified Data.ByteString as B
import qualified Data.ByteString.Base64 as B
import qualified Data.ByteString.Char8 as BC
import Network.Mime (defaultMimeLookup)

fileToBase64 :: FilePath -> IO String
fileToBase64 filename = do
  file <- B.readFile filename
  return $ "data:" ++ (BC.unpack $ defaultMimeLookup $ T.pack filename)
             ++ ";base64," ++ (BC.unpack $ B.encode file)    
