"use client";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TransitionProvider } from "./Transition";
import { BackToTop, Footer, Grain, Nav } from "./Chrome";
import Home from "../screens/Home";
import Articles from "../screens/Articles";
import Post from "../screens/Post";
import Photography from "../screens/Photography";
import Album from "../screens/Album";
import Moments from "../screens/Moments";
import Projects from "../screens/Projects";
import Archive from "../screens/Archive";
import Friends from "../screens/Friends";
import About from "../screens/About";
import Missing from "../screens/Missing";

export default function AppRoot() {
  return (
    <BrowserRouter>
      <TransitionProvider>
        <Grain />
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:slug" element={<Post />} />
          <Route path="/photography" element={<Photography />} />
          <Route path="/photography/:slug" element={<Album />} />
          <Route path="/moments" element={<Moments />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Missing />} />
        </Routes>
        <Footer />
        <BackToTop />
      </TransitionProvider>
    </BrowserRouter>
  );
}
