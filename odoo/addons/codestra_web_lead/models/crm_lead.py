from odoo import fields, models


class CrmLead(models.Model):
    _inherit = "crm.lead"

    x_codestra_external_lead_id = fields.Char(
        string="Codestra External Lead ID",
        copy=False,
        index="btree",
        readonly=True,
        help=(
            "Immutable idempotency identifier assigned by the private Codestra "
            "website lead adapter. It must not be generated in the browser by Odoo."
        ),
    )

    _sql_constraints = [
        (
            "codestra_external_lead_id_unique",
            "UNIQUE(x_codestra_external_lead_id)",
            "The Codestra external lead ID must be unique.",
        ),
    ]
