import { PageHeader } from '../../../shared/components/page'
import { AdminShell } from '../../admin/components/admin-shell'
import { UserForm } from '../components/user-form'
import { useUserForm } from '../hooks/use-user-form'
import type { StaffEntityConfig } from '../lib/staff-entity-config'
import { STAFF_ENTITY_THEME } from '../lib/staff-entity-theme'

export function StaffUserCreatePage({ entity }: { entity: StaffEntityConfig }) {
  const form = useUserForm({
    mode: 'create',
    entity,
  })
  const isRoleAccount = entity.kind === 'tutor' || entity.kind === 'marketing'
  const look = STAFF_ENTITY_THEME[entity.kind]

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo={entity.listPath}
          backLabel={entity.plural}
          title={entity.createTitle ?? `Add ${entity.singular}`}
          description={
            entity.createDescription ??
            `Create a ${entity.singular.toLowerCase()} account with profile, contact, and role details.`
          }
          icon={look.icon}
          theme={look.theme}
          pattern={look.pattern}
        />

        {isRoleAccount ? (
          <UserForm
            mode="create"
            values={form.values}
            errors={form.errors}
            isSubmitting={form.isSubmitting}
            entityLabel={entity.singular}
            entityKind={entity.kind}
            defaultRoleCode={entity.defaultRoleCode}
            onChange={form.updateField}
            onSubmit={form.submit}
            onCancel={form.cancel}
          />
        ) : (
          <UserForm
            mode="create"
            values={form.values}
            errors={form.errors}
            isSubmitting={form.isSubmitting}
            entityLabel={entity.singular}
            onChange={form.updateField}
            onSubmit={form.submit}
            onCancel={form.cancel}
          />
        )}
      </div>
    </AdminShell>
  )
}
