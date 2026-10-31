import { useState, useEffect } from 'react';
import { vietqrService } from '@/services/vietqr.service';

export function useSupplierBank(isOpen, supplier) {
  const [banks, setBanks] = useState([]);
  const [bankSearch, setBankSearch] = useState('');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [branch, setBranch] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadBanks() {
      try {
        const bankList = await vietqrService.getBanks();
        if (isMounted) setBanks(bankList);
      } catch (err) {
        console.error(err);
      }
    }

    if (isOpen) {
      loadBanks();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (supplier) {
      const bInfo = supplier.bankInfo || {};
      setAccountNumber(bInfo.accountNumber || '');
      setAccountHolder((bInfo.accountHolder || '').toUpperCase());
      setBranch(bInfo.branch || '');

      if (bInfo.bankCode || bInfo.bankName) {
        setSelectedBank({
          code: bInfo.bankCode,
          name: bInfo.bankName,
          shortName: bInfo.bankShortName || bInfo.bankCode,
          logo: bInfo.bankLogo,
        });
      } else {
        setSelectedBank(null);
      }
    } else {
      setSelectedBank(null);
      setAccountNumber('');
      setAccountHolder('');
      setBranch('');
    }
  }, [isOpen, supplier]);

  const filteredBanks = banks.filter((b) => {
    if (!bankSearch.trim()) return true;
    const q = bankSearch.toLowerCase();
    return (
      (b.shortName && b.shortName.toLowerCase().includes(q)) ||
      (b.code && b.code.toLowerCase().includes(q)) ||
      (b.name && b.name.toLowerCase().includes(q))
    );
  });

  const buildBankPayload = () => ({
    bankCode: selectedBank?.code || '',
    bankName: selectedBank?.name || '',
    bankShortName: selectedBank?.shortName || '',
    bankLogo: selectedBank?.logo || '',
    accountNumber: accountNumber.trim(),
    accountHolder: accountHolder.trim().toUpperCase(),
    branch: branch.trim(),
  });

  return {
    banks,
    bankSearch,
    setBankSearch,
    isBankDropdownOpen,
    setIsBankDropdownOpen,
    selectedBank,
    setSelectedBank,
    accountNumber,
    setAccountNumber,
    accountHolder,
    setAccountHolder,
    branch,
    setBranch,
    filteredBanks,
    buildBankPayload,
  };
}
