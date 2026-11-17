import type { ProjectStatus } from '@/projects';

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  const tone = status === 'منفّذ' ? 'is-done' : 'is-developing';
  return <span className={`status-badge ${tone}`} data-testid="status-project"><span aria-hidden="true" />{status}</span>;
}
