import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import BackButton from "./components/BackButton";
import Spinner from "./components/Spinner";

const ShowBook = () => {
  const [book, setBook] = useState({});
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:8080/api/v1/book/${id}`)
      .then((response) => {
        setBook(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
      });
  }, [id]);

  const formatDate = (dateString) => {

    const dateObject = new Date(dateString);

    if (isNaN(dateObject.getTime())) {
      return "Invalid Date";
    }

    const day = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
      dateObject
    );
    const date = new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }).format(dateObject);
    const time = dateObject.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return `${date} (${day}) ${time}`;
  };

  return (
    <div className="p-4 flex items-center justify-center flex-col">
      <div className="flex w-full justify-start">
        <BackButton />
      </div>
      <h1 className="text-3xl my-10 w-full text-center">Show Book</h1>
      {loading ? (
        <Spinner />
      ) : (
        <div className="flex flex-col border-2 border-sky-400 rounded-xl w-fit p-4">
          <div className="my-4">
            <span className="text-xl mr-4 text-gray-500">Id : </span>
            <span>{book._id}</span>
          </div>
          <div className="my-4">
            <span className="text-xl mr-4 text-gray-500">Title : </span>
            <span>{book.title}</span>
          </div>
          <div className="my-4">
            <span className="text-xl mr-4 text-gray-500">Author : </span>
            <span>{book.author}</span>
          </div>
          <div className="my-4">
            <span className="text-xl mr-4 text-gray-500">Publish Year : </span>
            <span>{book.publishYear}</span>
          </div>
          <div className="my-4">
            <span className="text-xl mr-4 text-gray-500">Create Time : </span>
            <span>{formatDate(book.createdAt)}</span>
          </div>
          <div className="my-4">
            <span className="text-xl mr-4 text-gray-500">Last Update Time : </span>
            <span>{formatDate(book.updatedAt)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowBook;
