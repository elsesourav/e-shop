const StripeLogo = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 25 25"
    xmlSpace="preserve"
    width={25}
    height={25}
    {...props}
  >
    <path
      style={{
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        fill: '#635bff',
      }}
      d="M0 0h25v25H0z"
    />
    <path
      d="M11.525 9.719c0 -0.588 0.481 -0.819 1.281 -0.819 1.15 0 2.6 0.35 3.75 0.969v-3.55C15.3 5.819 14.063 5.625 12.813 5.625c-3.069 0 -5.106 1.6 -5.106 4.275 0 4.169 5.744 3.506 5.744 5.306 0 0.694 -0.606 0.919 -1.45 0.919 -1.256 0 -2.856 -0.512 -4.125 -1.206v3.594c1.406 0.606 2.825 0.863 4.125 0.863 3.144 0 5.306 -1.556 5.306 -4.263 -0.025 -4.5 -5.781 -3.7 -5.781 -5.394"
      style={{
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        fill: '#fff',
      }}
    />
  </svg>
);
export default StripeLogo;
