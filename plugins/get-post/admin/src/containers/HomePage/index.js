/*
 *
 * HomePage
 *
 */

import axios from "axios";
import React, { memo, useState, useEffect } from "react";
// import PropTypes from 'prop-types';

const HomePage = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios
      .get("https://jsonplaceholder.typicode.com/posts")
      .then((res) => {
        setPosts(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const onSavePost = (post) => {
    axios
      .post("http://localhost:1337/get-post", {
        title: post.title,
        body: post.body,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="container">
      <h1>Posts</h1>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Title</th>
            <th scope="col">Body</th>
            <th scope="col">Option</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <th scope="row">{post.id}</th>
              <td>{post.title}</td>
              <td>{post.body}</td>
              <th scope="row">
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() => onSavePost(post)}
                >
                  Save
                </button>
              </th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default memo(HomePage);
