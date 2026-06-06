export function VDBAdminIcon() {
  return (
    <span className="vdb-admin-logo">
      {/* eslint-disable-next-line @next/next/no-img-element -- Payload admin logo must stay simple. */}
      <img alt="VD BARRISOL" src="/brand/vd-barrisol-logo-transparent.png" />
    </span>
  )
}

export function VDBAdminLogo() {
  return <VDBAdminIcon />
}
