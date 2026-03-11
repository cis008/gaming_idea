import RetroNavbar from "./RetroNavbar";

function Navbar({ theme, onThemeChange, heroBackground, onHeroBackgroundChange, backgroundOptions, isHomePage, isLoginPage }) {
  return (
    <RetroNavbar
      theme={theme}
      onThemeChange={onThemeChange}
      heroBackground={heroBackground}
      onHeroBackgroundChange={onHeroBackgroundChange}
      backgroundOptions={backgroundOptions}
      isHomePage={isHomePage}
      isLoginPage={isLoginPage}
    />
  );
}

export default Navbar;
