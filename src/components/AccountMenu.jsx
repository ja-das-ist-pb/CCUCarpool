import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function AccountMenu({ userEmail, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // 點選單以外的地方就收起來
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!userEmail)
    return (
      <Link to="/login" className="account-btn">
        登入
      </Link>
    );

  return (
    <div className="account" ref={ref}>
      <button className="account-btn" onClick={() => setOpen(!open)}>
        Account
      </button>
      {open && (
        <div className="account-menu">
          <p className="account-email">{userEmail}</p>
          <button
            className="account-btn"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            登出
          </button>
        </div>
      )}
    </div>
  );
}