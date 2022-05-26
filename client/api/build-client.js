import React from 'react';
import axios from 'axios';

const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    //we are on the server

    return axios.create({
      //quando viene fatta una richiesta da next.js a ingress-nginx si porta dietro i cookie,
      //cosa non necessaria quando la richiesta la fa un browser
      baseURL:
        //'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
        'http://ticketing-app.cfd',
      headers: req.headers,
    });
  } else {
    //we are on the browser

    return axios.create({
      baseURL: '/',
    });
  }
};

export default buildClient;
