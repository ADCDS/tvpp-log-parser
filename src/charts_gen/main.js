// @flow

import DOMUtils from "../web/js/DOM/Utils";
import HandleHolder from "./DOM/HandleHolder";

DOMUtils.getGenericElementById<HTMLInputElement>("generateGLCButton").addEventListener("click", HandleHolder.handleGenerateGroupLayerChartButtonClick);
