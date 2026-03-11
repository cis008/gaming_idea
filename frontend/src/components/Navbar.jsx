import RetroNavbar from "./RetroNavbar";

function Navbar({ isHomePage, isLoginPage }) {
  return (
    <RetroNavbar
      isHomePage={isHomePage}
      isLoginPage={isLoginPage}
    />
  );
}

export default Navbar;
