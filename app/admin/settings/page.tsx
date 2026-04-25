export default function AdminSettingsPage() {
  return (
    <div className="row g-4">
      <div className="col-lg-7">
        <div className="admin-card">
          <div className="card-header">
            <h2 className="h4 mb-1">Definições da loja</h2>
            <div className="text-muted">Configuração básica do painel administrativo.</div>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Nome da loja</label>
                <input className="admin-form-control" defaultValue="PetBox" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Email de suporte</label>
                <input className="admin-form-control" defaultValue="rodrigoleite.96@gmail.com" />
              </div>
              <div className="col-12">
                <label className="form-label fw-bold">Mensagem interna</label>
                <textarea className="admin-form-control" rows={4} defaultValue="Painel preparado para ligar a Supabase, Easypay e gestão real de encomendas." />
              </div>
            </div>
            <button className="admin-action-btn mt-4">Guardar alterações</button>
          </div>
        </div>
      </div>

      <div className="col-lg-5">
        <div className="admin-card">
          <div className="card-header">
            <h2 className="h5 mb-1">Integrações</h2>
            <div className="text-muted small">Estado previsto das integrações.</div>
          </div>
          <div className="card-body d-grid gap-3">
            <div className="d-flex justify-content-between align-items-center border rounded-4 p-3">
              <div><strong>Supabase</strong><div className="text-muted small">Auth e base de dados</div></div>
              <span className="admin-pill admin-pill-success">Configurado</span>
            </div>
            <div className="d-flex justify-content-between align-items-center border rounded-4 p-3">
              <div><strong>Easypay</strong><div className="text-muted small">MB WAY e checkout</div></div>
              <span className="admin-pill admin-pill-info">Preparado</span>
            </div>
            <div className="d-flex justify-content-between align-items-center border rounded-4 p-3">
              <div><strong>Resend</strong><div className="text-muted small">Emails do formulário</div></div>
              <span className="admin-pill admin-pill-success">Configurado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
