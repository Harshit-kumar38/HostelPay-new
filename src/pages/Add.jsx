import { useNavigate } from 'react-router-dom';
import ExpenseModal from '../components/ExpenseModal';

export default function Add() {
  const navigate = useNavigate();

  return (
    <ExpenseModal
      onClose={() => navigate(-1)}
      onSave={() => navigate('/dashboard')}
    />
  );
}
