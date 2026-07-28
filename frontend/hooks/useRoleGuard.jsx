import { useEffect } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "../context/AuthContext.jsx"

/**
 * Guards a page behind authentication and role checks. Redirects to the
 * login page if the current user is missing or not in allowedRoles.
 * @param {string[]} allowedRoles - Roles permitted to view the page (e.g. ["admin"]).
 * @returns {{user: Object|null, isAuthorized: boolean}} The current user and whether they're allowed here.
 */
export function useRoleGuard(allowedRoles) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const isAuthorized = !!user && allowedRoles.includes(user.role)

  useEffect(() => {
    if (!isAuthorized) {
      navigate("/")
    }
  }, [isAuthorized, navigate])

  return { user, isAuthorized }
}
