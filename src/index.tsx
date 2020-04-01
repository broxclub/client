import 'reflect-metadata';
import 'babel-polyfill';
import ReactModal from 'react-modal';

import 'classes/StockLib';
import { StockLib } from 'classes/StockLib';

ReactModal.setAppElement('body');

(window as any).StockLib = StockLib;

