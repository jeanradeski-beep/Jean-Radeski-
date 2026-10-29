/* Dados compartilhados das prévias.
   Procedimentos, textos e valores: material "Procedimentos Harmonização Facial" da Dra. Milena.
   Pacientes: exemplos fictícios para a demonstração do painel. */
window.MV = (function(){
  const WA = '5554991590445';
  const procs = [
    {id:'labios', slug:'preenchimento-labial', nome:'Preenchimento labial', img:'labios2.jpg', img2:'labios.jpg', min:60,
     curto:'Volume, contorno e proporção, sem perder a naturalidade.',
     desc:'Procedimento indicado para dar volume, contorno e proporção aos lábios, sempre respeitando a naturalidade do rosto. Mais do que aumentar, <b>o objetivo é equilibrar.</b>',
     indT:'Indicado para', ind:['Lábios finos','Assimetrias','Falta de contorno','Perda de volume com o tempo'],
     dur:'8 a 12 meses', parc:'3x de R$ 385,00', vista:1050, retornoDias:15, reaplicMeses:10},
    {id:'bio', slug:'bioestimulador-de-colageno', nome:'Bioestimulador de colágeno', img:'bioestimulador.jpg', min:60,
     curto:'Firmeza e qualidade de pele, com resultado progressivo.',
     desc:'Estimula a produção natural de colágeno, melhorando firmeza, textura e qualidade da pele. É um tratamento progressivo, o resultado vem com o tempo.',
     indT:'Indicado para', ind:['Flacidez','Perda de sustentação','Envelhecimento da pele'],
     dur:'até 18 meses', parc:'3x de R$ 550,00', vista:1500, retornoDias:30, reaplicMeses:12},
    {id:'facial', slug:'preenchimento-facial', nome:'Preenchimento facial', img:'facial.jpg', min:60,
     curto:'Contorno e equilíbrio: mandíbula, mento, maçãs e olheiras.',
     desc:'Reposiciona volumes e melhora o contorno do rosto, trazendo mais harmonia e equilíbrio facial. <b>Não é sobre exagero, é sobre proporção.</b>',
     indT:'Áreas mais comuns', ind:['Mandíbula','Mento (queixo)','Maçãs do rosto','Olheiras'],
     dur:'12 a 18 meses', parc:'3x de R$ 385,00', vista:1050, retornoDias:15, reaplicMeses:14},
    {id:'toxina', slug:'toxina-botulinica', nome:'Toxina botulínica', alias:'(Botox)', img:'toxina.jpg', min:30,
     curto:'Suaviza linhas de expressão e previne o envelhecimento precoce.',
     desc:'Responsável por suavizar linhas de expressão e prevenir o envelhecimento precoce. Age reduzindo a contração muscular, evitando que as rugas se aprofundem.',
     indT:'Indicado para', ind:['Testa','Entre as sobrancelhas','Pés de galinha'],
     dur:'4 a 6 meses', parc:'3x de R$ 350,00', vista:950, retornoDias:15, reaplicMeses:4},
    {id:'rino', slug:'rinomodelacao', nome:'Rinomodelação', img:'rino.jpg', min:60,
     curto:'Correção estética do nariz sem cirurgia, com resultado imediato.',
     desc:'Correção estética do nariz sem cirurgia, utilizando ácido hialurônico para alinhar e harmonizar o perfil. Resultado imediato, com técnica e precisão.',
     indT:'Indicado para', ind:['Elevar a ponta do nariz','Corrigir pequenas irregularidades','Melhorar o perfil'],
     dur:'10 a 14 meses', parc:'4x de R$ 350,00', vista:1250, retornoDias:15, reaplicMeses:12},
    {id:'limpeza', slug:'limpeza-de-pele', nome:'Limpeza de pele', img:'limpeza.jpg', min:60,
     curto:'Remove impurezas e prepara a pele para outros tratamentos.',
     desc:'Procedimento essencial para remover impurezas, controlar a oleosidade e melhorar a saúde da pele. Vai além da estética: prepara a pele para responder melhor a outros tratamentos e produtos.',
     indT:'Indicado para', ind:['Cravos (comedões)','Oleosidade excessiva','Poros obstruídos','Textura irregular','Acne leve'],
     extraT:'O que é feito', extra:['Higienização profunda','Esfoliação','Extração de cravos','Máscara calmante','Finalização com ativos específicos'],
     dur:'a cada 30 a 45 dias', durLabel:'Frequência', parc:null, vista:130, retornoDias:0, reaplicMeses:1}
  ];
  const byId = Object.fromEntries(procs.map(p=>[p.id,p]));
  const brl = v => 'R$ ' + v.toLocaleString('pt-BR',{minimumFractionDigits:2, maximumFractionDigits:2});
  const wa = (txt, num) => 'https://wa.me/' + (num||WA) + '?text=' + encodeURIComponent(txt);

  // Pacientes de exemplo
  const pacientes = [
    {id:1,nome:'Ana Paula Ferreira',nasc:'12/03/1991',idade:35,cidade:'Erechim',origem:'Instagram',tel:'(54) 9 9999-0001',
     alerta:null,anamnese:{gestante:'Não',alergias:'Não',anticoag:'Não',autoimune:'Não',herpes:'Não',recente:'Sim · lábios 03/2026'},
     hist:[{d:'2026-03-14',p:'labios',det:'1 ml de ácido hialurônico',lote:'[lote]',valor:1050},{d:'2026-06-20',p:'toxina',det:'52 U · testa, sobrancelhas, pés de galinha',lote:'[lote]',valor:950}]},
    {id:2,nome:'Camila Rocha',nasc:'02/07/1999',idade:27,cidade:'Erechim',origem:'Instagram',tel:'(54) 9 9999-0002',
     alerta:['warn','Herpes labial recorrente: confirmar profilaxia antes dos lábios'],anamnese:{gestante:'Não',alergias:'Não',anticoag:'Não',autoimune:'Não',herpes:'Sim',recente:'Não'},
     hist:[{d:'2026-09-30',p:null,det:'Avaliação facial',lote:'—',valor:0}]},
    {id:3,nome:'Beatriz Lemos',nasc:'19/11/1994',idade:31,cidade:'Erechim',origem:'Instagram',tel:'(54) 9 9999-0003',
     alerta:['bad','Faltou sem aviso em 27/10: taxa de 15% para reagendar'],anamnese:{gestante:'Não',alergias:'Dipirona',anticoag:'Não',autoimune:'Não',herpes:'Não',recente:'Não'},
     hist:[{d:'2026-10-06',p:null,det:'Avaliação · veio do vídeo “Queixo pontudo?”',lote:'—',valor:0}]},
    {id:4,nome:'Fernanda Kuhn',nasc:'05/05/1980',idade:46,cidade:'Erechim',origem:'Indicação',tel:'(54) 9 9999-0004',
     alerta:['warn','Usa anticoagulante: avaliar antes de injetáveis'],anamnese:{gestante:'Não',alergias:'Não',anticoag:'Sim',autoimune:'Não',herpes:'Não',recente:'Sim · bioestimulador 08/2026'},
     hist:[{d:'2026-08-25',p:'bio',det:'1ª sessão',lote:'[lote]',valor:1500}]},
    {id:5,nome:'Larissa Mattos',nasc:'21/01/2002',idade:24,cidade:'Erechim',origem:'Google',tel:'(54) 9 9999-0005',
     alerta:null,anamnese:{gestante:'Não',alergias:'Não',anticoag:'Não',autoimune:'Não',herpes:'Não',recente:'Não'},
     hist:[{d:'2026-08-12',p:'limpeza',det:'Limpeza completa',lote:'—',valor:130},{d:'2026-09-24',p:'limpeza',det:'Limpeza completa',lote:'—',valor:130}]},
    {id:6,nome:'Patrícia Souza',nasc:'30/09/1997',idade:29,cidade:'Florianópolis',origem:'Instagram',tel:'(48) 9 9999-0006',
     alerta:null,anamnese:{gestante:'Não',alergias:'Não',anticoag:'Não',autoimune:'Não',herpes:'Não',recente:'Não'},
     hist:[]},
    {id:7,nome:'Juliana Prado',nasc:'14/02/1993',idade:33,cidade:'Erechim',origem:'Site',tel:'(54) 9 9999-0007',
     alerta:null,anamnese:{gestante:'Não',alergias:'Não',anticoag:'Não',autoimune:'Não',herpes:'Não',recente:'Não'},
     hist:[{d:'2025-12-10',p:'labios',det:'1 ml de ácido hialurônico',lote:'[lote]',valor:1050}]},
    {id:8,nome:'Renata Bauer',nasc:'08/08/1986',idade:40,cidade:'Erechim',origem:'Indicação',tel:'(54) 9 9999-0008',
     alerta:null,anamnese:{gestante:'Não',alergias:'Não',anticoag:'Não',autoimune:'Não',herpes:'Não',recente:'Não'},
     hist:[{d:'2026-02-03',p:'toxina',det:'48 U',lote:'[lote]',valor:950},{d:'2026-06-30',p:'toxina',det:'50 U',lote:'[lote]',valor:950}]},
    {id:9,nome:'Sofia Lima',nasc:'27/04/2000',idade:26,cidade:'Erechim',origem:'Instagram',tel:'(54) 9 9999-0009',
     alerta:null,anamnese:{gestante:'Não',alergias:'Não',anticoag:'Não',autoimune:'Não',herpes:'Não',recente:'Não'},
     hist:[{d:'2026-09-29',p:'limpeza',det:'Limpeza completa',lote:'—',valor:130}]},
    {id:10,nome:'Mariana Costa',nasc:'03/12/1989',idade:36,cidade:'Florianópolis',origem:'Instagram',tel:'(48) 9 9999-0010',
     alerta:null,anamnese:{gestante:'Não',alergias:'Não',anticoag:'Não',autoimune:'Não',herpes:'Não',recente:'Não'},
     hist:[{d:'2026-05-15',p:'rino',det:'Rinomodelação',lote:'[lote]',valor:1250},{d:'2026-07-17',p:'facial',det:'Mento · 1 ml',lote:'[lote]',valor:1050}]},
    {id:11,nome:'Gabriela Nunes',nasc:'17/06/1984',idade:42,cidade:'Florianópolis',origem:'Google',tel:'(48) 9 9999-0011',
     alerta:null,anamnese:{gestante:'Não',alergias:'Não',anticoag:'Não',autoimune:'Não',herpes:'Não',recente:'Não'},
     hist:[{d:'2026-07-10',p:'bio',det:'1ª sessão',lote:'[lote]',valor:1500},{d:'2026-09-11',p:'bio',det:'2ª sessão',lote:'[lote]',valor:1500}]},
    {id:12,nome:'Helena Wolff',nasc:'25/10/1978',idade:48,cidade:'Erechim',origem:'Indicação',tel:'(54) 9 9999-0012',
     alerta:null,anamnese:{gestante:'Não',alergias:'Não',anticoag:'Não',autoimune:'Não',herpes:'Não',recente:'Não'},
     hist:[{d:'2026-06-05',p:'toxina',det:'56 U',lote:'[lote]',valor:950}]}
  ];
  const pac = Object.fromEntries(pacientes.map(p=>[p.id,p]));

  // Agenda de hoje (o painel usa a data do dia em que for aberto)
  const hoje = [
    {t:'09:00',pac:1,p:'toxina',nota:'reaplicação',u:'Erechim',s:'ok'},
    {t:'10:20',pac:2,p:'labios',nota:'1ª sessão',u:'Erechim',s:'ok'},
    {t:'11:40',pac:3,p:'facial',nota:'mento',u:'Erechim',s:'falta'},
    {t:'14:10',pac:4,p:'bio',nota:'2ª sessão',u:'Erechim',s:'ok'},
    {t:'15:30',pac:5,p:'limpeza',nota:'mensal',u:'Erechim',s:'pend'},
    {t:'16:50',pac:6,p:'rino',nota:'avaliação',u:'Florianópolis',s:'encaixe'}
  ];
  const amanha = [
    {t:'09:40',pac:7,p:'labios',u:'Erechim'},
    {t:'13:30',pac:8,p:'toxina',u:'Erechim'},
    {t:'16:10',pac:9,p:'limpeza',u:'Erechim'}
  ];
  const status = {ok:['p-ok','Confirmada'],pend:['p-warn','Sem resposta'],falta:['p-bad','Faltou'],encaixe:['p-info','Encaixe']};
  const unitDays = {'Erechim':[1,2,3],'Florianópolis':[4,5]};

  return {WA,procs,byId,brl,wa,pacientes,pac,hoje,amanha,status,unitDays};
})();
