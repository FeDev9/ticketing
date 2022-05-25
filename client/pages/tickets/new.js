import Router from 'next/router';
import React, { useState } from 'react';
import useRequest from '../../hooks/use-request';

const NewTicket = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  const onBlur = () => {
    const value = parseFloat(price);

    if (isNaN(value)) {
      return;
    }

    setPrice(value.toFixed(2));
  };

  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: {
      title,
      price,
    },
    onSuccess: (ticket) => Router.push('/'),
  });

  const onSubmit = (e) => {
    e.preventDefault();

    doRequest();
  };

  return (
    <>
      <h1>Create a Ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="">Title</label>
          <input
            type="text"
            className="form-control"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
          />
        </div>
        <div className="form-group">
          <label htmlFor="">Price</label>
          <input
            type="text"
            className="form-control"
            onBlur={onBlur}
            onChange={(e) => setPrice(e.target.value)}
            value={price}
          />
        </div>
        {errors}
        <button className="btn btn-primary" onClick={onSubmit}>
          Submit
        </button>
      </form>
    </>
  );
};

export default NewTicket;
